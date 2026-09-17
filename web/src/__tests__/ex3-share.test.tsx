import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from '../components/NoteEditor';
import { fakeApi, note } from './helpers';

describe('share from the editor', () => {
  it('creates a link and copies it to the clipboard', async () => {
    const api = fakeApi([note({ id: 'n1' })]);
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<NoteEditor api={api} note={note({ id: 'n1' })} currentUserId="user_alice" />);

    await userEvent.click(screen.getByRole('button', { name: 'Share' }));

    expect(await screen.findByRole('button', { name: 'Link copied' })).toBeInTheDocument();
    expect(api.shareNote).toHaveBeenCalledWith({ noteId: 'n1', userId: 'user_alice' });
    expect(writeText).toHaveBeenCalledWith('https://notes.example.com/s/n1-token');
  });
});
