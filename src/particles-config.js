// src/particles-config.js
const particlesConfig = {
    particles: {
      number: {
        value: 100, // More particles for a denser effect
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#DEC19B",
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.7,
        random: true,
      },
      size: {
        value: 2,
        random: true,
      },
      links: {
        enable: true,
        distance: 120,
        color: "#DEC19B",
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: "none",
        out_mode: "out",
        straight: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "bubble",
        },
      },
      modes: {
        bubble: {
          distance: 200,
          size: 4,
          duration: 2,
          opacity: 0.8,
        },
      },
    },
    // --- THIS IS THE NEW POLYGON MASK SECTION ---
    polygon: {
      enable: true,
      type: "inside",
      move: {
        radius: 10,
      },
      // This defines the shape the particles will be drawn inside.
      // You can create your own shape at https://particles.js.org/docs/classes/Options_Classes_PolygonMask.PolygonMask.html
      data: {
        "path": "M8.4,3.5c0,0,11.5,1.1,12.1,0.9c0.6-0.2,0-2.2,0-2.2s-2.9,0.9-3.2,0.9c-0.3,0-3.5-0.1-3.5-0.1S10.2,2.3,9.9,2.4C9.6,2.5,8.4,3.5,8.4,3.5z M4.9,4.6c0,0,11.5,2.4,12.1,2.2c0.6-0.2-0.2-2.7-0.2-2.7s-3,1.3-3.2,1.3c-0.3,0-3.5-0.2-3.5-0.2S6.3,5.3,6,5.4C5.7,5.5,4.9,4.6,4.9,4.6z M2.6,8.1c0,0,9.1,3.2,9.6,3c0.5-0.2,1.1-2.5,1.1-2.5S10,9.9,9.8,9.9c-0.2,0-3.5-0.2-3.5-0.2S2.9,9.4,2.7,9.5C2.4,9.6,2.6,8.1,2.6,8.1z M3.3,12.3c0,0,6.5,2.7,6.9,2.5c0.4-0.2,1.3-2,1.3-2s-2.1,1-2.3,1c-0.2,0-3-0.2-3-0.2s-3.2,0-3.4,0.1S3.3,12.3,3.3,12.3z M6.2,16.5c0,0,3.3,1,3.5,0.9c0.2-0.1,0.8-1.1,0.8-1.1s-1,0.5-1.1,0.5c-0.1,0-2.1-0.1-2.1-0.1S6.1,16.5,6.2,16.5z M23,3.5c0,0-11.5,1.1-12.1,0.9C10.3,4.2,11,2.2,11,2.2s2.9,0.9,3.2,0.9c0.3,0,3.5-0.1,3.5-0.1s3.2,0.1,3.5,0.2C21.6,3.4,23,3.5,23,3.5z M26.5,4.6c0,0-11.5,2.4-12.1,2.2c-0.6-0.2,0.2-2.7,0.2-2.7s3,1.3,3.2,1.3c0.3,0,3.5-0.2,3.5-0.2s3.2,0,3.4,0.1C25.1,5.4,26.5,4.6,26.5,4.6z M28.8,8.1c0,0-9.1,3.2-9.6,3c-0.5-0.2-1.1-2.5-1.1-2.5S21.4,9.9,21.6,9.9c0.2,0,3.5-0.2,3.5-0.2s3.2,0,3.4,0.1C28.8,9.6,28.8,8.1,28.8,8.1z M28.1,12.3c0,0-6.5,2.7-6.9,2.5c-0.4-0.2-1.3-2-1.3-2s2.1,1,2.3,1c0.2,0,3-0.2,3-0.2s3.2,0,3.4,0.1S28.1,12.3,28.1,12.3z M25.2,16.5c0,0-3.3,1-3.5,0.9c-0.2-0.1-0.8-1.1-0.8-1.1s1,0.5,1.1,0.5c0.1,0,2.1-0.1,2.1-0.1S25.3,16.5,25.2,16.5z",
        "size": { "width": 32, "height": 18 }
      }
    },
    retina_detect: true,
    background: { color: "transparent" },
    fullScreen: { enable: false },
  };
  
  export default particlesConfig;