// Offer payload — sent from peer A to peer B
interface OfferPayload {
  offer: RTCSessionDescriptionInit
  to: string    // socket ID of target peer
}

// Answer payload — sent from peer B to peer A
interface AnswerPayload {
  answer: RTCSessionDescriptionInit
  to: string
}

// ICE candidate payload
interface IceCandidatePayload {
  candidate: RTCIceCandidateInit
  to: string
}

interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback'
  sdp?: string
}

interface RTCIceCandidateInit {
  candidate?: string
  sdpMid?: string | null
  sdpMLineIndex?: number | null
}