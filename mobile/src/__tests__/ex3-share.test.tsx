import React from 'react';
import { Share } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NoteEditorScreen } from '../screens/NoteEditorScreen';
import { fakeApi, note } from './helpers';

describe('share from the editor', () => {
  it('creates a link and opens the share sheet', async () => {
    const api = fakeApi([note({ id: 'n1' })]);
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as any);
    render(<NoteEditorScreen note={note({ id: 'n1' })} onSave={jest.fn()} api={api} currentUserId="user_alice" />);

    fireEvent.press(screen.getByTestId('share'));

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(api.shareNote).toHaveBeenCalledWith({ noteId: 'n1', userId: 'user_alice' });
    expect(share.mock.calls[0][0].message).toBe('https://notes.example.com/s/n1-token');
  });

  it('does not render a share button without a session', () => {
    render(<NoteEditorScreen note={note({ id: 'n1' })} onSave={jest.fn()} />);
    expect(screen.queryByTestId('share')).toBeNull();
  });
});
