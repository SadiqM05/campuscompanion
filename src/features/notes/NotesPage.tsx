import { useState, useEffect, type FC, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { getUrl, uploadData } from "aws-amplify/storage";
import { client } from "../../lib/amplifyClient";
import type { Schema } from "../../../amplify/data/resource";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

interface Note {
  id: string;
  name: string | null;
  description: string | null;
  image: string | null;
  owner: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface DeleteNoteParams {
  id: string;
}

const NotesPage: FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  const fetchNotes = async (): Promise<void> => {
    const { data: notes } = await client.models.Note.list();
    const notesWithUrls = await Promise.all(
      notes.map(async (note: Note) => {
        if (note.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${note.image}`,
          });
          note.image = String(linkToStorageFile.url);
        }
        return note;
      })
    );
    setNotes(notesWithUrls);
  };

  useEffect(() => {
    // Standard fetch-on-mount; fetchNotes is also reused after create/delete
    // to refresh the list, so it stays a standalone function rather than an
    // inline effect body (which is what this rule expects).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
  }, []);

  const createNote = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const form = new FormData(event.target as HTMLFormElement);
    const imageFile = form.get("image") as File;

    // `@aws-amplify/backend`'s generated `createType` for this model currently
    // resolves to a broken index-signature type (a known type-inference bug,
    // unrelated to the actual runtime shape) - asserted here to work around it.
    const noteInput = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      image: imageFile.name,
    } as unknown as Schema["Note"]["createType"];
    const { data: newNote } = await client.models.Note.create(noteInput);

    if (newNote && newNote.image)
      await uploadData({
        path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
        data: imageFile,
      }).result;

    fetchNotes();
    (event.target as HTMLFormElement).reset();
  };

  const deleteNote = async ({ id }: DeleteNoteParams): Promise<void> => {
    await client.models.Note.delete({ id });
    fetchNotes();
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-foreground">Notes</h1>

      <Card>
        <form onSubmit={createNote} className="flex flex-col gap-4">
          <Input name="name" placeholder="Note Name" aria-label="Note Name" required />
          <Input
            name="description"
            placeholder="Note Description"
            aria-label="Note Description"
            required
          />
          <input
            name="image"
            type="file"
            accept="image/png, image/jpeg"
            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-foreground hover:file:bg-accent-hover"
          />
          <Button type="submit" className="self-start">
            Create Note
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Current Notes</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id || note.name} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground">{note.name}</h3>
                <button
                  type="button"
                  onClick={() => deleteNote(note)}
                  aria-label={`Delete ${note.name}`}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{note.description}</p>
              {note.image && (
                <img
                  src={note.image}
                  alt={`visual aid for ${note.name}`}
                  className="mt-1 h-40 w-full rounded-lg object-cover"
                />
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
