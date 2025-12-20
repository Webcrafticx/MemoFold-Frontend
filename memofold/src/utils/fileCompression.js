// utils/fileCompression.js

// Format file size for display
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type
export const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'other';
};

// Check if file needs compression
export const shouldCompressFile = (file) => {
    if (!file) return false;
    
    const type = getFileType(file);
    
    if (type === 'image') {
        return file.size > 5 * 1024 * 1024; // > 5MB
    }
    
    if (type === 'video') {
        return file.size > 10 * 1024 * 1024; // > 10MB
    }
    
    return false;
};

// Image compression using Canvas API
export const compressImage = async (file, onProgress = null) => {
    return new Promise((resolve) => {
        // If no compression needed or not an image
        if (!shouldCompressFile(file) || getFileType(file) !== 'image') {
            resolve(file);
            return;
        }

        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            if (onProgress) onProgress(30);
            
            let width = img.width;
            let height = img.height;
            const maxSize = 1920;

            // Resize if too large
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.floor((height * maxSize) / width);
                    width = maxSize;
                } else {
                    width = Math.floor((width * maxSize) / height);
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            if (onProgress) onProgress(60);

            // Compress to JPEG with 70% quality
            canvas.toBlob(
                (blob) => {
                    if (onProgress) onProgress(90);
                    
                    if (blob) {
                        const compressedFile = new File(
                            [blob],
                            `compressed_${file.name.replace(/\.[^/.]+$/, "")}.jpg`,
                            { type: 'image/jpeg' }
                        );
                        
                        if (onProgress) onProgress(100);
                        setTimeout(() => resolve(compressedFile), 100);
                    } else {
                        if (onProgress) onProgress(100);
                        setTimeout(() => resolve(file), 100);
                    }
                },
                'image/jpeg',
                0.7
            );
        };

        img.onerror = () => {
            console.log('Image load error, using original file');
            if (onProgress) onProgress(100);
            setTimeout(() => resolve(file), 100);
        };

        img.src = URL.createObjectURL(file);
    });
};

// Video compression using MediaRecorder API
export const compressVideo = async (file, onProgress = null) => {
    return new Promise((resolve) => {
        // If no compression needed or not a video
        if (!shouldCompressFile(file) || getFileType(file) !== 'video') {
            resolve(file);
            return;
        }

        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = async () => {
            if (onProgress) onProgress(20);

            // Create canvas for video frames
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size (max 720p)
            const maxWidth = 1280;
            const maxHeight = 720;
            let width = video.videoWidth;
            let height = video.videoHeight;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;

            // Create stream from canvas
            const stream = canvas.captureStream(30);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 1000000, // 1 Mbps
            });

            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                if (onProgress) onProgress(90);
                
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const compressedFile = new File(
                        [blob],
                        `compressed_${file.name.replace(/\.[^/.]+$/, "")}.webm`,
                        { type: 'video/webm' }
                    );
                    
                    // Cleanup
                    stream.getTracks().forEach(track => track.stop());
                    URL.revokeObjectURL(video.src);
                    
                    if (onProgress) onProgress(100);
                    setTimeout(() => resolve(compressedFile), 100);
                } else {
                    URL.revokeObjectURL(video.src);
                    stream.getTracks().forEach(track => track.stop());
                    
                    if (onProgress) onProgress(100);
                    setTimeout(() => resolve(file), 100);
                }
            };

            mediaRecorder.onerror = () => {
                console.log('MediaRecorder error, using original file');
                URL.revokeObjectURL(video.src);
                stream.getTracks().forEach(track => track.stop());
                
                if (onProgress) onProgress(100);
                setTimeout(() => resolve(file), 100);
            };

            // Start recording
            mediaRecorder.start();

            if (onProgress) onProgress(50);

            // Draw video frames to canvas
            video.currentTime = 0;
            video.play().catch(e => console.log('Video play error:', e));

            const drawFrame = () => {
                if (video.currentTime >= video.duration || video.ended) {
                    mediaRecorder.stop();
                    return;
                }

                ctx.drawImage(video, 0, 0, width, height);
                requestAnimationFrame(drawFrame);
            };

            video.onseeked = () => {
                if (onProgress) onProgress(70);
                drawFrame();
            };

            // Stop after video duration
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, video.duration * 1000);
        };

        video.onerror = () => {
            console.log('Video load error, using original file');
            URL.revokeObjectURL(video.src);
            
            if (onProgress) onProgress(100);
            setTimeout(() => resolve(file), 100);
        };
    });
};

// Check video duration
export const checkVideoDuration = (file) => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };
        
        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            resolve(0);
        };
        
        video.src = URL.createObjectURL(file);
    });
};