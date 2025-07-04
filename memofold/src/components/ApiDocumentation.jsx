import React from 'react';

const ApiDocumentation = () => {
  // Data for endpoints
  const endpoints = {
    shareMemory: {
      method: 'POST',
      path: '/memories/share',
      description: 'Share a memory with other users or make it publicly accessible.',
      requestBody: `{
  "memory_id": "mem_12345",
  "share_type": "public|private",
  "recipients": ["user@example.com"],
  "expiration": "2025-12-31T23:59:59Z",
  "permissions": ["view", "comment"]
}`,
      response: `{
  "success": true,
  "share_id": "share_67890",
  "share_url": "https://memory-app.com/shared/share_67890",
  "expiration": "2025-12-31T23:59:59Z",
  "created_at": "2025-06-19T10:30:00Z"
}`,
      params: [
        { parameter: 'memory_id', type: 'string', required: 'Yes', description: 'Unique identifier of the memory to share' },
        { parameter: 'share_type', type: 'string', required: 'Yes', description: 'Either "public" or "private"' },
        { parameter: 'recipients', type: 'array', required: 'No', description: 'Email addresses for private sharing' },
        { parameter: 'expiration', type: 'string', required: 'No', description: 'ISO 8601 datetime when share expires' },
        { parameter: 'permissions', type: 'array', required: 'No', description: 'Available actions: "view", "comment", "download"' },
      ]
    },
    getSharedMemories: {
      method: 'GET',
      path: '/memories/shared',
      description: 'Retrieve a list of memories shared with you or by you.',
      queryExample: 'GET /memories/shared?type=received&limit=20&offset=0',
      response: `{
  "success": true,
  "memories": [
    {
      "share_id": "share_67890",
      "memory_id": "mem_12345",
      "title": "Summer Vacation 2025",
      "shared_by": "friend@example.com",
      "shared_at": "2025-06-19T10:30:00Z",
      "expiration": "2025-12-31T23:59:59Z",
      "permissions": ["view", "comment"]
    }
  ],
  "total": 1,
  "has_more": false
}`
    },
    createMemory: {
      method: 'POST',
      path: '/memories',
      description: 'Create and store a new memory in your account.',
      requestBody: `{
  "title": "My Amazing Memory",
  "description": "A detailed description of this memory",
  "content": {
    "type": "mixed",
    "items": [
      {
        "type": "text",
        "content": "This was an amazing day..."
      },
      {
        "type": "image",
        "url": "https://example.com/image.jpg",
        "caption": "Beautiful sunset"
      }
    ]
  },
  "tags": ["vacation", "family", "2025"],
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "name": "New York City"
  },
  "privacy": "private",
  "date_occurred": "2025-06-15T18:30:00Z"
}`,
      response: `{
  "success": true,
  "memory": {
    "id": "mem_12345",
    "title": "My Amazing Memory",
    "description": "A detailed description of this memory",
    "created_at": "2025-06-19T10:30:00Z",
    "updated_at": "2025-06-19T10:30:00Z",
    "privacy": "private",
    "content_items": 2,
    "tags": ["vacation", "family", "2025"]
  }
}`
    },
    getMemory: {
      method: 'GET',
      path: '/memories/{memory_id}',
      description: 'Retrieve a specific memory by its ID.',
      response: `{
  "success": true,
  "memory": {
    "id": "mem_12345",
    "title": "My Amazing Memory",
    "description": "A detailed description of this memory",
    "content": {
      "type": "mixed",
      "items": [...]
    },
    "tags": ["vacation", "family", "2025"],
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "name": "New York City"
    },
    "privacy": "private",
    "date_occurred": "2025-06-15T18:30:00Z",
    "created_at": "2025-06-19T10:30:00Z",
    "updated_at": "2025-06-19T10:30:00Z"
  }
}`
    },
    updateMemory: {
      method: 'PUT',
      path: '/memories/{memory_id}',
      description: 'Update an existing memory.',
      requestBody: `{
  "title": "Updated Memory Title",
  "description": "Updated description",
  "tags": ["vacation", "family", "2025", "updated"]
}`
    },
    deleteMemory: {
      method: 'DELETE',
      path: '/memories/{memory_id}',
      description: 'Permanently delete a memory from your account.',
      response: `{
  "success": true,
  "message": "Memory successfully deleted"
}`
    }
  };

  // Error codes data
  const errorCodes = {
    success: [
      { code: '200', description: 'OK - The request was successful' },
      { code: '201', description: 'Created - Resource was successfully created' },
    ],
    clientErrors: [
      { code: '400', description: 'Bad Request - Invalid request parameters' },
      { code: '401', description: 'Unauthorized - Invalid or missing API key' },
      { code: '403', description: 'Forbidden - Insufficient permissions' },
      { code: '404', description: 'Not Found - Resource does not exist' },
      { code: '429', description: 'Too Many Requests - Rate limit exceeded' },
    ],
    serverErrors: [
      { code: '500', description: 'Internal Server Error - Something went wrong on our end' },
      { code: '503', description: 'Service Unavailable - Temporary server overload' },
    ]
  };

  // Helper component for HTTP method badges
  const HttpMethodBadge = ({ method }) => {
    const colors = {
      GET: 'bg-green-500',
      POST: 'bg-blue-500',
      PUT: 'bg-orange-500',
      DELETE: 'bg-red-500'
    };
    
    return (
      <span className={`${colors[method]} text-white px-3 py-1 rounded-md text-sm font-semibold font-mono`}>
        {method}
      </span>
    );
  };

  // Helper component for code blocks
  const CodeBlock = ({ children }) => (
    <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
      <pre className="font-mono text-gray-200 text-sm">
        {children}
      </pre>
    </div>
  );

  // Helper component for endpoint cards
  const EndpointCard = ({ endpoint }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
        <HttpMethodBadge method={endpoint.method} />
        <span className="font-mono text-gray-800 font-medium">{endpoint.path}</span>
      </div>
      
      <p className="mb-6 text-gray-700">{endpoint.description}</p>
      
      {endpoint.requestBody && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Request Body</h4>
          <CodeBlock>{endpoint.requestBody}</CodeBlock>
        </div>
      )}
      
      {endpoint.queryExample && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Query Parameters</h4>
          <CodeBlock>{endpoint.queryExample}</CodeBlock>
        </div>
      )}
      
      {endpoint.response && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Response</h4>
          <CodeBlock>{endpoint.response}</CodeBlock>
        </div>
      )}
      
      {endpoint.params && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Parameters</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase">Parameter</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase">Required</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {endpoint.params.map((param, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 font-mono text-sm text-indigo-500">{param.parameter}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{param.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{param.required}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Helper component for error code items
  const ErrorCodeItem = ({ code, description, color = 'bg-green-500' }) => (
    <div className="flex items-center gap-4 bg-gray-50 rounded-md p-3">
      <span className={`${color} text-white px-2 py-1 rounded-md text-sm font-semibold font-mono min-w-[40px] text-center`}>
        {code}
      </span>
      <span className="text-gray-700 font-medium">{description}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 to-purple-700 text-white py-8 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">MemoFold</h1>
            <p className="text-lg opacity-90 font-light">Share and Store Your Memories</p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex overflow-x-auto">
            {['overview', 'authentication', 'memory-sharing', 'memory-storage', 'errors'].map((id) => (
              <li key={id} className="shrink-0">
                <a 
                  href={`#${id}`}
                  className="block px-6 py-4 text-gray-700 font-medium border-b-3 border-transparent hover:text-indigo-500 hover:border-indigo-500 hover:bg-gray-50 transition-all duration-300"
                >
                  {id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        <section id="overview" className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-3 border-indigo-500">API Overview</h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <p className="mb-6 text-gray-700">
              The Memofold API allows you to share and store memories through a simple REST interface. All API
              endpoints are accessed via HTTPS and return JSON responses.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Base URL</h3>
              <CodeBlock>https://api.memofold.com/v1</CodeBlock>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Rate Limits</h3>
              <ul className="list-inside text-gray-700">
                <li className="mb-1">100 requests per minute for authenticated users</li>
                <li>20 requests per minute for unauthenticated users</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Authentication Section */}
        <section id="authentication" className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-3 border-indigo-500">Authentication</h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <p className="mb-6 text-gray-700">
              The Memofold API uses API keys for authentication. Include your API key in the Authorization header
              of your requests.
            </p>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Header Format</h3>
              <CodeBlock>Authorization: Bearer YOUR_API_KEY</CodeBlock>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Example Request</h3>
              <CodeBlock>
                {`curl -H "Authorization: Bearer YOUR_API_KEY" \\\n     -H "Content-Type: application/json" \\\n     https://api.memofold.com/v1/memories`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Memory Sharing Section */}
        <section id="memory-sharing" className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-3 border-indigo-500">Memory Sharing</h2>
          
          <EndpointCard endpoint={endpoints.shareMemory} />
          <EndpointCard endpoint={endpoints.getSharedMemories} />
        </section>

        {/* Memory Storage Section */}
        <section id="memory-storage" className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-3 border-indigo-500">Memory Storage</h2>
          
          <EndpointCard endpoint={endpoints.createMemory} />
          <EndpointCard endpoint={endpoints.getMemory} />
          <EndpointCard endpoint={endpoints.updateMemory} />
          <EndpointCard endpoint={endpoints.deleteMemory} />
        </section>

        {/* Error Codes Section */}
        <section id="errors" className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-3 border-indigo-500">Error Codes</h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <p className="mb-6 text-gray-700">
              The Memory API uses conventional HTTP response codes to indicate the success or failure of an API request.
            </p>
            
            <div className="space-y-8">
              {/* Success Codes */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Success Codes</h3>
                <div className="space-y-2">
                  {errorCodes.success.map((error, index) => (
                    <ErrorCodeItem key={index} code={error.code} description={error.description} color="bg-green-500" />
                  ))}
                </div>
              </div>
              
              {/* Client Error Codes */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Client Error Codes</h3>
                <div className="space-y-2">
                  {errorCodes.clientErrors.map((error, index) => (
                    <ErrorCodeItem key={index} code={error.code} description={error.description} color="bg-red-500" />
                  ))}
                </div>
              </div>
              
              {/* Server Error Codes */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Server Error Codes</h3>
                <div className="space-y-2">
                  {errorCodes.serverErrors.map((error, index) => (
                    <ErrorCodeItem key={index} code={error.code} description={error.description} color="bg-orange-500" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Error Response Format</h4>
              <CodeBlock>
                {`{\n  "success": false,\n  "error": {\n    "code": "INVALID_MEMORY_ID",\n    "message": "The specified memory ID does not exist",\n    "details": {\n      "memory_id": "mem_invalid"\n    }\n  }\n}`}
              </CodeBlock>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="opacity-80">&copy; 2025 Memofold API. Built with preserving memories.</p>
        </div>
      </footer>
    </div>
  );
};

export default ApiDocumentation;