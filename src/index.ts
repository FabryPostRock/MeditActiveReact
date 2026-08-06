interface Greeting {
  recipient: string;
  message: string;
}

const greeting: Greeting = {
  recipient: 'WSL',
  message: 'TypeScript è configurato correttamente',
};

console.log(`${greeting.message} per ${greeting.recipient}.`);
