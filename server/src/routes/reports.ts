import { Router } from 'express';
export const reportsRouter = Router();

reportsRouter.get('/categories', (_req, res) => {
  res.json([
    { id: 'nudity', label: 'Nudity or sexual content' },
    { id: 'harassment', label: 'Harassment' },
    { id: 'hate', label: 'Hate or abuse' },
    { id: 'spam', label: 'Spam' },
    { id: 'scam', label: 'Scam' },
    { id: 'underage', label: 'Underage user' },
    { id: 'other', label: 'Other' }
  ]);
});
