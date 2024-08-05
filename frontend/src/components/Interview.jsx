import Video from "./Video";
import Messages from "./Messages";
import "../styles/Interview.css";

const Interview = ({ user, selectedSession }) => {
  return (
    <div className="interview-container">
      <Video />
      <Messages user={user} selectedSession={selectedSession} />
    </div>
  );
};

export default Interview;
