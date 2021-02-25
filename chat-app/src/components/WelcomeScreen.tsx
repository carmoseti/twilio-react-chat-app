import React, {ChangeEvent, CSSProperties, FunctionComponent} from "react";
import {
    Grid,
    TextField,
    Card,
    AppBar,
    Toolbar,
    Typography,
    Button,
} from "@material-ui/core";
import {useHistory} from "react-router-dom";

const styles :{[key:string]:CSSProperties} = {
    header: {},
    grid: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    card: { padding: 40 },
    textField: { width: 300 },
    gridItem: { paddingTop: 12, paddingBottom: 12 },
    button: { width: 300 },
};

interface WelcomeScreenProps {}

const WelcomeScreen :FunctionComponent<WelcomeScreenProps> = (props)=>{
    const [email, setEmail] = React.useState<string>("");
    const [room, setRoom] = React.useState<string>("");

    const history = useHistory();

    const login = () =>{
        if (email && room) history.push('chat',{room,email}); // Redirect to /chat route
    }

    const handleChange = (event :ChangeEvent<HTMLInputElement>) => {
        switch (event.target.name) {
            case "email":
                setEmail(event.target.value);
                break;
            case "room":
                setRoom(event.target.value);
                break;
            default:
                return;
        }
    };

    return (
        <>
            <AppBar style={styles.header}
                    elevation={10}>
                <Toolbar>
                    <Typography variant={"h6"}>
                        Chat App with Twilio Programmable Chat and React
                    </Typography>
                </Toolbar>
            </AppBar>
            <Grid style={styles.grid}
                  container={true}
                  direction={"column"}
                  justify={"center"}
                  alignItems={"center"}>
                <Card style={styles.card}
                      elevation={10}>
                    <Grid item={true}
                          style={styles.gridItem}>
                        <TextField name={'email'}
                                   required={true}
                                   style={styles.textField}
                                   label={"Email Address"}
                                   placeholder={"Enter email address"}
                                   variant={"outlined"}
                                   type={'email'}
                                   value={email}
                                   onChange={handleChange} />
                    </Grid>
                    <Grid item style={styles.gridItem}>
                        <TextField
                            name="room"
                            required
                            style={styles.textItem}
                            label="Room"
                            placeholder="Enter room name"
                            variant="outlined"
                            value={room}
                            onChange={handleChange}/>
                    </Grid>
                    <Grid item style={styles.gridItem}>
                        <Button
                            color="primary"
                            variant="contained"
                            style={styles.button}
                            onClick={login}>
                            Login
                        </Button>
                    </Grid>
                </Card>
            </Grid>
        </>
    );
}

export default WelcomeScreen;