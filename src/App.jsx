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
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */
Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

import './index.css';


export default function App() {
  const [notes, setNotes] = useState([]);



  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    setNotes(notes);
  }

  async function createNote(event) {
    event.preventDefault();

    // ⛔ Block if there are already 10 notes
    if (notes.length >= 10) {
      alert("You can only create up to 10 notes.");
      return;
    }

    const form = new FormData(event.target);

    const name = form.get("name").trim();
    const description = form.get("description").trim();

    // Enforce a character limit
    if (description.length > 500) {
      alert("Note is too long. Maximum 500 characters.");
      return;
    }

    const { data: newNote } = await client.models.Note.create({
      name,
      description,
      image: "", // no image allowed
    });

    console.log(newNote);
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const { data: deletedNote } = await client.models.Note.delete({ id });
    console.log(deletedNote);
    fetchNotes();
  }

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
          <Heading level={1} style={{ fontSize: '2rem', marginTop: '4rem' }}>
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
          <Heading level={1} style={{ fontSize: '2rem', marginTop: '4rem' }}>
            My Current notes
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


