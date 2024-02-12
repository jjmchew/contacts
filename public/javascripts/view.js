export class View {
  #templates;
  #cards;
  #create;
  #edit;
  #filterTags;
  #list;
  #screen;

  constructor() {
    this.#cards = this.#getElement('section#cards');
    this.#filterTags = this.#getElement('nav div.filterTags');
    this.#create = this.#getElement('#create');
    this.#edit = this.#getElement('#edit');
    this.#list = this.#getElement('#list');
    this.#screen = [this.#list, this.#edit, this.#create];
    this.#prepHandlebars();
  }

  // public methods
  addTag(tagName) {
    if (tagName === '') tagName = 'No tags';

    const newTag = document.createElement('div');
    newTag.innerHTML = this.#templates['filterTagsTemplate']({tag: tagName});

    this.#filterTags.innerHTML = newTag.innerHTML;
  }

  clearTag() {
    this.#filterTags.innerHTML = "";
  }

  addCard(data) {
    this.#cards.appendChild(this.#makeCard(data));
  }

  updateCard(data) {
    const oldCard = cards.querySelector(`#cards #card-${String(data.id)}`);
    this.#cards.replaceChild(this.#makeCard(data), oldCard);
  }

  removeAllCards() {
    let node = this.#cards.firstElementChild;
    let nextNode;
    while (node) {
      nextNode = node.nextElementSibling;
      node.remove();
      node = nextNode;
    }
  }

  displayCards(contacts) {
    if (contacts.length === 0) {
      this.displayNoContacts();
      return;
    }

    contacts.forEach(contact => {
      const tmp = document.createElement('div');
      tmp.innerHTML = this.#templates['cardTemplate'](contact);
      this.#cards.appendChild(tmp.firstElementChild);
    });

    window.scrollTo(0, 0);
  }

  deleteCard(id) {
    const card = document.querySelector(`#cards #card-${String(id)}`);
    card.remove();
  }

  showCreate() {
    this.#show(this.#create);
    this.showEditTags('');
  }

  showEdit(info) {
    this.#show(this.#edit);

    document.querySelector('#edit form').setAttribute('data-id', String(info.id));
    document.querySelector('#editName').value = info.name;
    document.querySelector('#editEmail').value = info.email;
    document.querySelector('#editPhone').value = info.phone;

    this.showEditTags(info.tags);
  }

  resetForm(element) {
    element.reset();
    element.querySelector('dd.editTags').innerHTML = '';
  }

  showList() {
    this.#show(this.#list);
  }

  displayNoContacts() {
    const msg = document.createElement('div');
    msg.classList.add('message');
    msg.appendChild(document.createTextNode('There are no contacts'));
    this.#cards.appendChild(msg);
  }

  showEditTags(tagString) {
    const containers = document.querySelectorAll('dd.editTags');
    containers.forEach(container => {
      container.innerHTML = this.#templates['editTags']({tags: tagString});
    });
  }

  // private methods
  #makeCard(data) {
    const newCard = document.createElement('div');
    newCard.innerHTML = this.#templates['cardTemplate'](data);

    return newCard.firstElementChild;
  }

  #show(element) {
    this.#screen.forEach(screen => {
      let toggle = false;
      if (screen === element) toggle = true;
      this.#toggleShow(screen, toggle);
    });
    window.scrollTo(0, 0);
  }

  #getElement(selector) {
    return document.querySelector(selector);
  }

  #toggleShow(element, show) {
    if (show) element.classList.remove('hide');
    else element.classList.add('hide');
  }

  #prepHandlebars() {
    // partials (process first)
    document.querySelectorAll('[data-type=partial]').forEach(tmp => {
      Handlebars.registerPartial(tmp['id'], tmp['innerHTML']);
    });

    // templates
    this.#templates = {};
    const tmps = document.querySelectorAll('script[type="text/x-handlebars"]');
    tmps.forEach(tmp => {
      this.#templates[tmp['id']] = Handlebars.compile(tmp['innerHTML']);

      // remove from DOM after processed
      tmp.remove();
    });

    // helpers
    Handlebars.registerHelper('tagLinks', function(tagString) {
      if (tagString === null || tagString === '') return '<div class="notags"></div>';

      let html = '';
      tagString.split(',').forEach(tag => {
        html += `<div class='tag'>${tag}</div>`;
      })
      return html;
    });

    Handlebars.registerHelper('filterTags', function(tagString) {
      if (tagString === null || tagString === '') return;

      let html = '';
      tagString.split(',').forEach(tag => {
        html += `<div class='filterTag'>${tag}<span class="closeButton"></span></div>`;
      })
      return html;
    });

  }

}