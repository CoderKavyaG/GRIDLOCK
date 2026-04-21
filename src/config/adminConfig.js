// Admin email list - add your admin emails here
export const ADMIN_EMAILS = [
  'admin@example.com', // Replace with actual admin emails
  'owner@moctalecopy.com',
  'codecraftkavya@gmail.com'
];

export const isAdminEmail = (email) => {
  return email && ADMIN_EMAILS.includes(email.toLowerCase());
};

export const getAdminRole = (email) => {
  return isAdminEmail(email) ? 'admin' : 'user';
};
