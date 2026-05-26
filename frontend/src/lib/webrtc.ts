export const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80"
    },
    {
      urls: `turn:${import.meta.env.VITE_TURN_URL}:80`,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL
    },
    {
      urls: `turn:${import.meta.env.VITE_TURN_URL}:80?transport=tcp`,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL
    },
    {
      urls: `turn:${import.meta.env.VITE_TURN_URL}:443`,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL
    },
    {
      urls: `turns:${import.meta.env.VITE_TURN_URL}:443?transport=tcp`,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL
    }
  ]
}