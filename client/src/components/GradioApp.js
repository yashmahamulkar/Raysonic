import React from 'react';

function GradioApp() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <iframe
        src="https://85cf315395878c9c75.gradio.live/"
        title="GradioApp"
        width="99%"
        height="99%"
        style={{ border: 'none' }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        body="light"
      />
    </div>
  );
}

export default GradioApp;
