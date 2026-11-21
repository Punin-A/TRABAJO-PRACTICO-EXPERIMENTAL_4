import jwt from 'jsonwebtoken';

export function signToken(userId) {
  return jwt.sign({}, process.env.JWT_SECRET, { subject: String(userId), expiresIn: '8h' });
}

export function requireAuth(req, res, next) {
  const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
  if (!match) return res.status(401).json({ message: 'Debes iniciar sesión.' });
  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.userId = payload.sub;
    if (!req.userId) throw new Error('Missing subject');
    next();
  } catch {
    res.status(401).json({ message: 'La sesión no es válida o ha expirado.' });
  }
}
