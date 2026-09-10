import { useRef, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useVideo } from "../../context/VideoContext";
import { getPostMediaItems } from "../../utils/getPostMediaItems";

const getRenderableImageUrl = (url) => {
    if (!url || typeof url !== "string") return url;

    const isDng = /\.dng(\?|$)/i.test(url);
    const isCloudinary =
        url.includes("res.cloudinary.com") && url.includes("/upload/");

    if (isDng && isCloudinary) {
        return url.replace("/upload/", "/upload/f_auto,q_auto/");
    }

    return url;
};

const PostMediaCarousel = ({
    post,
    onImagePreview,
    className = "",
}) => {
    const items = getPostMediaItems(post);
    const [activeIndex, setActiveIndex] = useState(0);
    const { isGlobalMuted, setGlobalMuted, activeVideoId, setActiveVideoId } = useVideo();
    const videoRef = useRef(null);
    const touchStartX = useRef(null);

    const slideKey = (index) => `${post._id}:${index}`;
    const activeItem = items[activeIndex];

    useEffect(() => {
        setActiveIndex(0);
    }, [post._id]);

    // Pause / play video when slide or global active video changes
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !activeItem || activeItem.type !== "video") return;

        const key = slideKey(activeIndex);
        if (activeVideoId === key) {
            video.muted = isGlobalMuted;
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    }, [activeIndex, activeVideoId, activeItem, isGlobalMuted, post._id]);

    // Pause when leaving a video slide
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.pause();
            }
        };
    }, [activeIndex]);

    if (!items.length) return null;

    const goTo = (index) => {
        if (items.length <= 1) return;
        const next = ((index % items.length) + items.length) % items.length;
        // If leaving a video that was active, clear active id
        if (activeItem?.type === "video" && activeVideoId === slideKey(activeIndex)) {
            setActiveVideoId(null);
        }
        setActiveIndex(next);
    };

    const handleVideoPlay = () => {
        setActiveVideoId(slideKey(activeIndex));
    };

    const handleVolumeChange = (e) => {
        setGlobalMuted(e.target.muted);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current == null || items.length <= 1) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) goTo(activeIndex + 1);
        else goTo(activeIndex - 1);
    };

    const displayUrl =
        activeItem.type === "image"
            ? getRenderableImageUrl(activeItem.url)
            : activeItem.url;

    return (
        <div
            className={`w-full mb-3 overflow-hidden rounded-xl relative ${className}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="relative w-full flex justify-center bg-transparent" style={{ maxHeight: "24rem" }}>
                {activeItem.type === "image" ? (
                    <img
                        src={displayUrl}
                        alt="Post"
                        className="max-h-96 max-w-full object-contain cursor-pointer rounded-xl"
                        onClick={() => onImagePreview && onImagePreview(displayUrl)}
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                ) : (
                    <video
                        ref={videoRef}
                        key={slideKey(activeIndex)}
                        src={displayUrl}
                        className="w-full h-auto max-h-96 object-contain rounded-xl"
                        muted={isGlobalMuted || activeVideoId !== slideKey(activeIndex)}
                        loop
                        playsInline
                        controls
                        controlsList="nodownload nofullscreen noplaybackrate"
                        onContextMenu={(e) => e.preventDefault()}
                        onPlay={handleVideoPlay}
                        onVolumeChange={handleVolumeChange}
                        preload="metadata"
                        style={{ backgroundColor: "transparent", display: "block" }}
                    />
                )}

                {items.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                goTo(activeIndex - 1);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 cursor-pointer hidden sm:flex"
                            aria-label="Previous media"
                        >
                            <FaChevronLeft size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                goTo(activeIndex + 1);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 cursor-pointer hidden sm:flex"
                            aria-label="Next media"
                        >
                            <FaChevronRight size={14} />
                        </button>
                    </>
                )}
            </div>

            {items.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-2">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => goTo(i)}
                            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-colors ${
                                i === activeIndex ? "bg-blue-500" : "bg-gray-400/60"
                            }`}
                            aria-label={`Go to media ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostMediaCarousel;
