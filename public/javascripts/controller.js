export class Controller {
  #model;
  #view;
  #cards;
  #createForm;
  #editForm;
  #filters = {search: null, tag: null};
  #currentTags;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;

    this.#init();
  }

  #init() {
    this.#cards = document.querySelector('#cards');
    this.#createForm = document.querySelector('#create form');
    this.#editForm = document.querySelector('#edit form');
    this.#initialCardDisplay();
    this.#addEventListeners();
  }

  #isButton(target) {
    return target.className.includes('button');
  }

  #addEventListeners() {
    // #region for cancel buttons =======
    document.querySelectorAll('input[value="Cancel"]')
    .forEach(button => {
      button.addEventListener('click', e => {
        this.#handleCancel();
      });
    });
    // #endregion

    // #region for create =======
    document.querySelector('#create')
    .addEventListener('click', e => {
      e.preventDefault();
      if (this.#isButton(e.target) && e.target.value === 'Submit') {
        this.#handleCreateSubmit();
      }
    });
    // #endregion

    // #region for edit =======
    document.querySelector('#edit')
    .addEventListener('click', e => {
      e.preventDefault();
      if (this.#isButton(e.target) && e.target.value === 'Submit') {
        let id = e.target.parentNode.getAttribute('data-id');
        this.#handleEditSubmit(parseInt(id, 10));
      }
    });
    // #endregion

    // #region for create/edit tags =======
    document.querySelectorAll('dd.editTags').forEach(element => {

      element.addEventListener('click', e => {

        if (e.target.tagName === 'SPAN') {
          let tag = e.target.parentNode.firstChild.textContent.trim();
          this.#currentTags.remove(tag);
          this.#view.showEditTags(this.#currentTags.tagString());
        }

        if (e.target.tagName === 'BUTTON') {
          let tag = element.querySelector('div.editTags input').value;
          this.#currentTags.add(tag);
          this.#view.showEditTags(this.#currentTags.tagString());
        }

      });

    });
    // #endregion

    // #region for nav =======
    document.querySelector('#list div.button').addEventListener('click', () => {
      this.#view.showCreate();
      this.#currentTags = this.#model.manageTags('');
    });

    document.querySelector('#list input').addEventListener('keyup', e => {
      this.#handleSearch(e.target.value);
    });

    document.querySelector('#list div.filterTags').addEventListener('click', e => {
      if (e.target.tagName === 'SPAN') {
        this.#filters.tag = null;
        this.#view.clearTag();
        this.#updateView();
      }
    });
    // #endregion

    // #region for cards =======
    this.#cards.addEventListener('click', e => {
      const text = e.target.textContent;

      if (e.target.tagName === 'DIV' && e.target.className.includes('tag')) {
        this.#handleTagClick(text);
      } else if (e.target.tagName === 'DIV') {
        const id = Number(e.target.parentNode.getAttribute('data-id'));
        if (text === 'Delete') this.#handleCardDelete(id);
        else if (text === 'Edit') this.#handleCardEdit(id)
      }

    });
    // #endregion
  }

  #updateView() {
    let set;
    if (this.#filters.search === '' && this.#filters.tag === null)
      set = this.#model.contacts();
    else set = this.#model.filter(this.#filters);
    this.#view.removeAllCards();
    this.#view.displayCards(set);
  }

  #handleSearch(query) {
    if (query === '') this.#filters.search = null;
    else this.#filters.search = query;
    this.#updateView();
  }

  #handleTagClick(tagName) {
    this.#filters.tag = tagName;
    this.#updateView();
    this.#view.addTag(tagName);
  }

  #handleCreateSubmit() {
    this.#model.add({
      full_name: this.#createForm['name'].value,
      email: this.#createForm['email'].value,
      phone_number: this.#createForm['phone'].value,
      tags: this.#currentTags.tagString(),
    })
    .then(data => {
      this.#view.resetForm(this.#createForm);
      this.#view.addCard(data);
    }).finally(() => {
      this.#view.showList();
    });
  }

  #handleEditSubmit(id) {
    this.#model.update({
      full_name: this.#editForm['name'].value,
      email: this.#editForm['email'].value,
      phone_number: this.#editForm['phone'].value,
      tags: this.#currentTags.tagString(),
    }, id)
    .then(data => {
      this.#view.updateCard(data);
      this.#view.resetForm(this.#editForm);
    }).finally(() => {
      this.#view.showList();
    });
  }

  #handleCancel() {
    this.#view.showList();

    // delay clearing forms until animation is complete
    setTimeout(() => {
      this.#view.resetForm(this.#editForm);
      this.#view.resetForm(this.#createForm);
    }, 500);
  }

  // for cards
  #initialCardDisplay() {
    this.#model.getContacts()
    .then(data => {
      console.log(data);
      this.#view.displayCards(data)
    })
    .catch(() => {
      this.#view.displayCards([]);
    });
  }

  #handleCardDelete(id) {
    if (this.#model.contacts().length === 1) this.#view.displayNoContacts();
    this.#view.deleteCard(id);
    this.#model.delete(id);
  }

  #handleCardEdit(id) {
    const contact = this.#model.contacts().filter(obj => obj.id === id)[0];
    this.#view.showEdit({
      id: id,
      name: contact.full_name,
      email: contact.email,
      phone: contact.phone_number,
      tags: contact.tags,
    });
    this.#currentTags = this.#model.manageTags(contact.tags);
  }
}