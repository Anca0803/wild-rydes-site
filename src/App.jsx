import { useState, useEffect } from "react";

import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import outputs from "../amplify_outputs_fixed";
import "./index.css";

// ✅ Configure Amplify (include auth mode by default)
Amplify.configure({
  ...outputs,
  DataStore: {
    authModeStrategyType: "multiAuth",
  },
  API: {
    GraphQL: {
      defaultAuthMode: "userPool", // 👈 FORCE Cognito User Pool
    },
  },
});

// ✅ Create Amplify client and attach Cognito token manually
const client = generateClient({
  authMode: "userPool",
  authToken: async () => {
    const session = await fetchAuthSession();
    const token = session?.tokens?.idToken?.toString();
    console.log("🔐 Token preview:", token ? token.slice(0, 50) + "..." : "❌ No token");
    return token;
  },
});

window.client = client;
console.log("🧩 Available models:", Object.keys(client.models));

export default function App() {
  const [notes, setNotes] = useState([]);

  async function fetchNotes() {
    try {
      const { data } = await client.models.Note.list();
      console.log("📄 Notes:", data);
      setNotes(data);
    } catch (error) {
      console.error("❌ Error fetching notes:", error);
    }
  }

  async function createNote(event) {
    event.preventDefault();

    if (notes.length >= 10) {
      alert("You can only create up to 10 notes.");
      return;
    }

    const form = new FormData(event.target);
    const name = form.get("name").trim();
    const description = form.get("description").trim();

    if (description.length > 500) {
      alert("Note is too long. Maximum 500 characters.");
      return;
    }

    try {
      const { data: newNote } = await client.models.Note.create({
        name,
        description,
        image: "",
      });
      console.log("✅ Created:", newNote);
      fetchNotes();
      event.target.reset();
    } catch (error) {
      console.error("❌ Error creating note:", error);
    }
  }

  async function deleteNote({ id }) {
    try {
      const { data: deletedNote } = await client.models.Note.delete({ id });
      console.log("🗑️ Deleted:", deletedNote);
      fetchNotes();
    } catch (error) {
      console.error("❌ Error deleting note:", error);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="100%"
          margin="0 auto"
        >
          <Heading level={1} style={{ fontSize: "2rem", marginTop: "4rem" }}>
            My To-Do List App
          </Heading>

          <View as="form" margin="4rem 1rem" onSubmit={createNote}>
            <Flex
              direction="column"
              justifyContent="center"
              gap="3rem"
              padding="2rem"
            >
              <TextField
                name="name"
                placeholder="Note Name"
                label="Note Name"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="description"
                placeholder="Note Description"
                label="Note Description"
                labelHidden
                variation="quiet"
              />

              <Button type="submit" variation="primary">
                Create a To-Do note
              </Button>
            </Flex>
          </View>

          <Divider />

          <Heading level={1} style={{ fontSize: "2rem", marginTop: "4rem" }}>
            My Current Notes
          </Heading>

          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {notes.map((note) => (
              <Flex
                key={note.id || note.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="2rem"
                border="2px solid #ccc"
                backgroundColor="white"
                padding="2rem"
                borderRadius="5%"
                className="box"
              >
                <View>
                  <Heading level="3">{note.name}</Heading>
                </View>
                <Text fontStyle="italic">{note.description}</Text>

                <Button
                  variation="destructive"
                  onClick={() => deleteNote(note)}
                >
                  Delete note
                </Button>
              </Flex>
            ))}
          </Grid>

          <Button onClick={signOut} variation="primary">
            Sign Out
          </Button>
        </Flex>
      )}
    </Authenticator>
  );
}
