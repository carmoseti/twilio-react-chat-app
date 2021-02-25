import React, {CSSProperties} from "react";
import { ListItem } from "@material-ui/core";
import {Message} from "twilio-chat/lib/message";

interface ReturnCSSProperties{
    (isOwnMessage :boolean):CSSProperties
}

const styles :{[key: string]:Partial<CSSProperties|ReturnCSSProperties>} = {
    listItem: (isOwnMessage :boolean) => ({
        flexDirection: "column",
        alignItems: isOwnMessage ? "flex-end" : "flex-start",
    }),
    container: (isOwnMessage :boolean) => ({
        maxWidth: "75%",
        borderRadius: 12,
        padding: 16,
        color: "white",
        fontSize: 12,
        backgroundColor: isOwnMessage ? "#054740" : "#262d31",
    }),
    author: { fontSize: 10, color: "gray" },
    timestamp: { fontSize: 8, color: "white", textAlign: "right", paddingTop: 4 },
};

export interface ChatItemProps {
    email :string;
    message :Message
}

const ChatItem :React.FunctionComponent<ChatItemProps> = (props)=>{
    const { message, email } = props;
    const isOwnMessage = message.author === email;

    return (
        <ListItem style={
            //@ts-ignore
            styles.listItem(isOwnMessage)}>
            <div style={styles.author}>{message.author}</div>
            <div style={
                //@ts-ignore
                styles.container(isOwnMessage)}>
                {message.body}
                <div style={styles.timestamp}>
                    {new Date(message.dateCreated.toISOString()).toLocaleString()}
                </div>
            </div>
        </ListItem>
    );
}

export default ChatItem;