// Message.js
import React from "react";

const Message = React.memo(({ msg }) => (
  <p className="message">
    <strong>{msg.user}: </strong>
    {msg.text}
  </p>
));

export default Message;
