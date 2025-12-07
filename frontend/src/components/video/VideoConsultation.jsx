import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Monitor, MonitorOff, MessageSquare } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';

const VideoConsultation = ({ appointmentId, patientName, doctorName }) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, connected, ended
    const [messages, setMessages] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [newMessage, setNewMessage] = useState('');

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const toast = useToast();

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnection) {
                peerConnection.close();
            }
        };
    }, [localStream, peerConnection]);

    const startCall = async () => {
        try {
            setCallStatus('connecting');

            // Get local media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Create peer connection
            const pc = new RTCPeerConnection(configuration);
            setPeerConnection(pc);

            // Add local stream tracks to peer connection
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Handle incoming stream
            pc.ontrack = (event) => {
                const [remoteStream] = event.streams;
                setRemoteStream(remoteStream);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    // Send candidate to remote peer via signaling server
                    // TODO: Implement signaling
                    console.log('ICE candidate:', event.candidate);
                }
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'connected') {
                    setCallStatus('connected');
                    toast?.success('Call connected');
                } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                    setCallStatus('ended');
                    toast?.error('Call disconnected');
                }
            };

            setCallStatus('connected');
            toast?.success('Call started');
        } catch (error) {
            console.error('Error starting call:', error);
            toast?.error('Failed to start call. Please check camera/microphone permissions.');
            setCallStatus('idle');
        }
    };

    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnection) {
            peerConnection.close();
        }
        setCallStatus('ended');
        setLocalStream(null);
        setRemoteStream(null);
        setPeerConnection(null);
        toast?.info('Call ended');
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });

                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace video track in peer connection
                if (peerConnection) {
                    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                }

                screenTrack.onended = () => {
                    toggleScreenShare(); // Stop sharing when user stops via browser UI
                };

                setIsScreenSharing(true);
                toast?.success('Screen sharing started');
            } else {
                // Switch back to camera
                const videoTrack = localStream.getVideoTracks()[0];
                if (peerConnection) {
                    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                }
                setIsScreenSharing(false);
                toast?.success('Screen sharing stopped');
            }
        } catch (error) {
            console.error('Screen share error:', error);
            toast?.error('Failed to share screen');
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            setMessages([...messages, {
                text: newMessage,
                sender: 'me',
                timestamp: new Date()
            }]);
            setNewMessage('');
            // TODO: Send via data channel
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-4 text-white">
                    <h1 className="text-2xl font-bold mb-1">Video Consultation</h1>
                    <p className="text-gray-400">
                        {callStatus === 'connected' && `Connected with ${doctorName || patientName}`}
                        {callStatus === 'connecting' && 'Connecting...'}
                        {callStatus === 'idle' && 'Ready to start call'}
                        {callStatus === 'ended' && 'Call ended'}
                    </p>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    {/* Remote Video (Main) */}
                    <div className="lg:col-span-2">
                        <Card className="relative aspect-video bg-gray-800 overflow-hidden">
                            {remoteStream ? (
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Waiting for remote video...</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Local Video + Chat */}
                    <div className="space-y-4">
                        {/* Local Video */}
                        <Card className="relative aspect-video bg-gray-800 overflow-hidden">
                            {localStream ? (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover mirror"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">You</p>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Chat Toggle */}
                        <Button
                            onClick={() => setShowChat(!showChat)}
                            className="w-full"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {showChat ? 'Hide' : 'Show'} Chat
                        </Button>

                        {/* In-Call Chat */}
                        {showChat && (
                            <Card className="p-4 h-64 flex flex-col">
                                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`p-2 rounded ${msg.sender === 'me'
                                                    ? 'bg-primary text-white ml-auto'
                                                    : 'bg-gray-200 dark:bg-gray-700'
                                                } max-w-[80%]`}
                                        >
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={sendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                                    />
                                    <Button type="submit" size="sm">Send</Button>
                                </form>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <Card className="p-4">
                    <div className="flex items-center justify-center gap-4">
                        {callStatus === 'idle' && (
                            <Button onClick={startCall} size="lg" className="bg-green-600 hover:bg-green-700">
                                <Video className="w-5 h-5 mr-2" />
                                Start Call
                            </Button>
                        )}

                        {(callStatus === 'connected' || callStatus === 'connecting') && (
                            <>
                                <Button
                                    onClick={toggleVideo}
                                    className={`${!isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                                >
                                    {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                </Button>

                                <Button
                                    onClick={toggleAudio}
                                    className={`${!isAudioEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                                >
                                    {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                </Button>

                                <Button
                                    onClick={toggleScreenShare}
                                    className={`${isScreenSharing ? 'bg-primary' : 'bg-gray-600 hover:bg-gray-700'}`}
                                >
                                    {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                                </Button>

                                <Button
                                    onClick={endCall}
                                    className="bg-red-600 hover:bg-red-700"
                                    size="lg"
                                >
                                    <Phone className="w-5 h-5 mr-2 rotate-135" />
                                    End Call
                                </Button>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
};

export default VideoConsultation;
