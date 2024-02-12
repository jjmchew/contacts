import { Model } from './model.js';
import { View } from './view.js';
import { Controller } from './controller.js';

console.log('contacts');

const ContactsApp = function () {
  return new Controller(new Model(), new View());
}

document.addEventListener('DOMContentLoaded', () => {
  ContactsApp();
});


/*
Need to complete:
- adding / editing tags
*/