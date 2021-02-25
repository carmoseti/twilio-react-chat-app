import React, {CSSProperties, RefObject} from "react";
import {
    AppBar,
    Backdrop,
    CircularProgress,
    Container,
    CssBaseline,
    Grid,
    IconButton,
    List,
    TextField,
    Toolbar,
    Typography,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import axios from "axios";
import ChatItem from "./ChatItem";
import {useHistory, RouteComponentProps} from "react-router-dom";
import Client from "twilio-chat";
import {Channel} from "twilio-chat/lib/channel";
import {Message} from "twilio-chat/lib/message";

const Chat = require("twilio-chat");

const styles :{[key:string]:CSSProperties} = {
    textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
    textFieldContainer: { flex: 1, marginRight: 12 },
    gridItem: { paddingTop: 12, paddingBottom: 12 },
    gridItemChatList: { overflow: "auto", height: "70vh" },
    gridItemMessage: { marginTop: 12, marginBottom: 12 },
    sendButton: { backgroundColor: "#3f51b5" },
    sendIcon: { color: "white" },
    mainGrid: { paddingTop: 100, borderWidth: 1 },
};

interface ChatScreenProps{}

const ChatScreen :React.FunctionComponent<ChatScreenProps & RouteComponentProps> = (props)=>{
    const scrollDiv :RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    const [text,setText] = React.useState<string>("");
    const [messages, setMessages] = React.useState<Array<Message>>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [channel, setChannel] = React.useState<Channel|null>(null);
    const [email, setEmail] = React.useState<string>("");
    const [room, setRoom] = React.useState<string>("");
    const [token, setToken] = React.useState<string>("");
    const [client, setClient] = React.useState<Client|null>(null);

    const history = useHistory();

    const getToken = (email :string) => {
        axios.get(`http://localhost:5000/token/${email}`).then((response)=>{
            const { data } = response;
            setToken(data.token);
        },(error)=>{
            console.error(error);
        });
    }

    const joinChannel = async (channel :Channel) => {
        console.log('Join channel : ', channel);
        //@ts-ignore
        if (channel.channelState.status !== "joined") {
            await channel.join();
        }

        setChannel(channel);
        setLoading(false);

        channel.on("messageAdded", handleMessageAdded);
    };

    const handleMessageAdded = (message :Message) => {
        setMessages([...messages, message]);
    };

    const scrollToBottom = () => {
        if (scrollDiv.current){
            const scrollHeight = scrollDiv.current.scrollHeight;
            const height = scrollDiv.current.clientHeight;
            const maxScrollTop = scrollHeight - height;
            scrollDiv.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
        }
    };

    const sendMessage = () => {
        if (text) {
            setLoading(true);
            if (channel) channel.sendMessage(String(text).trim());
            setText("");
            setLoading(false);
        }
    };

    React.useEffect(()=>{
        const { location } = props;
        const { state } = location || {};
        const { email, room } = (state || {}) as unknown as {
            email: string;
            room: string;
        };

        if (!email || !room) {
            history.replace("/");
        }

        setLoading(true);

        try {
            getToken(email);
            setEmail(email);
            setRoom(room);
        } catch {
            throw new Error("Unable to get token, please reload this page");
        }

    },[]);

    React.useEffect(()=>{
        if (token && !client){
            console.log('Creating client from token...');
            Chat.Client.create(token).then((client :Client)=>{
                setClient(client);

                console.log('Created client : ', client)

                client.on("tokenAboutToExpire", () => {
                    getToken(email);
                });

                client.on("tokenExpired",() => {
                    getToken(email);
                });

                client.on("channelJoined", async (channel) => {
                    // getting list of all messages since this is an existing channel
                    const messages = await channel.getMessages();
                    setMessages(messages.items || []);
                });

                try {
                    console.log('Client.getChannelByUniqueName');
                    client.getChannelByUniqueName(room).then((channel :Channel)=>{
                        console.log('Channel : ', channel);
                        joinChannel(channel);
                    }).catch(reason => {
                        console.error(reason);
                        try {
                            client.createChannel({
                                uniqueName: room,
                                friendlyName: room,
                            }).then((channel :Channel)=>{
                                joinChannel(channel);
                            });
                        } catch {
                            throw new Error("Unable to create channel, please reload this page");
                        }
                    });
                } catch(err) {
                    console.error(err);
                }
            });
        }

        if (token && client){
            console.log('Adding updated token to client...');
            client.updateToken(token);
        }

    },[token]);

    React.useEffect(()=>{
        channel && channel.on("messageAdded", handleMessageAdded);
        scrollToBottom();

        return ()=>{
            // NB: Cleanup to ensure handler uses the latest messages state
            channel && channel.removeListener("messageAdded",handleMessageAdded);
        };
    },[messages]);

    return (
        <Container component="main" maxWidth="md">
            <Backdrop open={loading} style={{ zIndex: 99999 }}>
                <CircularProgress style={{ color: "white" }} />
            </Backdrop>

            <AppBar elevation={10}>
                <Toolbar>
                    <Typography variant="h6">
                        {`Room: ${room}, User: ${email}`}
                    </Typography>
                </Toolbar>
            </AppBar>

            <CssBaseline />

            <Grid container direction="column" style={styles.mainGrid}>
                <Grid item style={styles.gridItemChatList} ref={scrollDiv}>
                    <List dense={true}>
                        {messages &&
                        messages.map((message) =>
                            <ChatItem
                                key={message.index}
                                message={message}
                                email={email}/>
                        )}
                    </List>
                </Grid>

                <Grid item style={styles.gridItemMessage}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center">
                        <Grid item style={styles.textFieldContainer}>
                            <TextField
                                required
                                style={styles.textField}
                                placeholder="Enter message"
                                variant="outlined"
                                multiline
                                rows={2}
                                value={text}
                                disabled={!channel}
                                onChange={(event) =>
                                    setText(event.target.value)
                                }/>
                        </Grid>

                        <Grid item>
                            <IconButton
                                style={styles.sendButton}
                                onClick={sendMessage}
                                disabled={!channel}>
                                <Send style={styles.sendIcon} />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}

export default ChatScreen;