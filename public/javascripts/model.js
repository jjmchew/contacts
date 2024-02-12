export class Model {
  #contacts = [];
  #allTags = [];

  constructor() {
    this.getContacts()
    .then(() => this.#populateTags());
  }

  contacts() {
    return this.#contacts;
  }

  tags() {
    return this.#allTags;
  }

  filter({search, tag}) {

    if (search === null && tag === null) return this.#contacts;

    const filteredSet = this.#contacts.filter(obj => {
      let searchMatch = search === null ? true : false;
      let tagMatch = tag === null ? true : false;

      if (search !== null) {
        const regex = new RegExp(search, 'i');
        if (regex.test(obj.full_name)) searchMatch = true;
        if (regex.test(obj.email)) searchMatch = true;
        if (regex.test(obj.phone_number)) searchMatch = true;
      } 
      
      if (tag !== null) {
        if (tag === '' && (obj.tags === '' || obj.tags === null)) tagMatch = true;
        else if (tag && obj.tags && obj.tags.includes(tag)) tagMatch = true;
      }

      return searchMatch && tagMatch;
    });

    return filteredSet;
  }

  add({full_name, email, phone_number, tags}) {
    return new Promise((res, rej) => {

      this.#apiSend({
        method: 'POST',
        url: '/api/contacts',
        responseType: 'json',
        status: 201,
        data: {
          full_name: full_name,
          email: email,
          phone_number: phone_number,
          tags: tags,
        },
        contentType: 'application/json; charset=utf-8',
      })
      .then(contact => {
        this.#contacts.push(contact);
        res(contact);
      })
      .catch(err => {
        console.error(err);
        rej(err);
      });

    });
  }

  update({full_name, email, phone_number, tags}, id) {
    let contactData = {
        full_name: full_name,
        email: email,
        phone_number: phone_number,
        tags: tags,
    };

    return new Promise((res, rej) => {

      this.#apiSend({
        method: 'PUT',
        url: `/api/contacts/${String(id)}`,
        responseType: 'json',
        status: 201,
        data: contactData,
        contentType: 'application/json; charset=utf-8',
      })
      .then(contact => {
        this.#dataUpdate(id, contactData);
        res(contact);
      })
      .catch(err => {
        console.error(err);
        rej(err);
      });

    });
  }

  delete(id) {
    this.#apiSend({
      method: 'DELETE',
      url: `/api/contacts/${String(id)}`,
      responseType: null,
      status: 204,
    })
    .then(() => {
      this.#dataDelete(id);
    })
    .catch(console.error);
  }

  manageTags(tagString) {
    let tags = !!tagString ? tagString.split(',') : [];

    return {
      tags: function() {
        return tags;
      },
      tagString: function() {
        return tags.join(',');
      },
      add: function(tag) {
        if (!tags.includes(tag)) tags.push(tag);
      },
      remove: function(tag) {
        if (!tags.includes(tag)) return;

        const idx = tags.findIndex(el => el === tag);
        tags.splice(idx, 1);
      }
    }
  }

  async getContacts() {
    try {
      let data;
      if (this.#contacts.length === 0) {
        data = await this.#apiSend({
          method: 'GET',
          url: '/api/contacts',
          responseType: 'json',
          status: 200
        });
        this.#contacts = data;
      } else {
        data = this.#contacts;
      }
      return new Promise(res => res(data));
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // private methods
  #apiSend({method, url, responseType, status, data, contentType}) {
    return new Promise((res, rej) => {
      let request = new XMLHttpRequest();
      request.open(method, url);
      if (responseType) request.responseType = 'json';
      if (contentType) request.setRequestHeader('Content-Type', contentType);
      if (data) request.send(JSON.stringify(data));
      else request.send();

      request.addEventListener('load', () => {
        if (request.status === status) res(request.response);
        else rej(new Error('API Error'));
      });
    });
  }

  #populateTags() {
    if (this.#contacts.length !== 0) {
      this.#contacts.forEach(contactObj => {
        if (contactObj.tags !== '' && contactObj.tags !== null) {
          this.#processTagString(contactObj.tags);
        }
      });
    }
  }
  
  #processTagString(tagString) {
    let tags = tagString.split(',');
    tags.forEach(tag => {
      if (this.#allTags.includes(tag)) return;
      this.#allTags.push(tag);
    });
  }

  #getIdx(id) {
    return this.#contacts.findIndex(obj => obj.id === id);
  }

  #dataUpdate(id, data) {
    let idx = this.#getIdx(id);
    for (const key in data) {
      this.#contacts[idx][key] = data[key];
    }
  }

  #dataDelete(id) {
    let idx = this.#getIdx(id);
    this.#contacts.splice(idx, 1);
    console.log(this.#contacts);
  }
}