const app = document.getElementById("app")
function fetchItems() {
  let items = JSON.parse(data);
  return items
}

function Store() {
   
   this._original_items = fetchItems();
   this._store = window.localStorage;
  //  this._items = this._original_items;
    this._items = new Paginator(this._original_items).page();

    this._query = ""


   this.init = function() {
      //  this._items = fetchItems();
      this._items = new Paginator(fetchItems()).page();
       this.items();
   }

   this.items = function() {
     return this._items;
   }
   
   this.search = function(type, query) {
     this.setItem(type, query)
     this._query = query
     // search logic here
     this.init()
     let q = query.toLowerCase()
    this._items = this._original_items.filter(item =>
         item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
        )
    //  this._items = this._items.filter(item => item.name.includes(query) || item.description.includes(query))
    this._items = new Paginator(this._items).page() 
  }

   this.sort = function(type, query) {
       this.setItem(type, query)
       //this.init();
       this._items.sort(function(a, b) {
           let q1 = a[query].toLowerCase();
           let q2 = b[query].toLowerCase();
           if (q1 > q2) {
               return 1
           }
           if (q1 < q2) {
               return -1
           }
           return 0
       })
   }
   
   this.setItem = function(type, query) {
     this._store.removeItem(type);
     this._store.setItem(type, query);
   }
   
   this.getItem = function(type) {
     return this._store.getItem(type);
   }
   
   this.clearAll = function() {
     this._store.clear()
   }
   this.hookPageChange = function(new_items) {
    this._items = new_items;
  } 

  this.query = function() {
    return this._query
  }
  this.setQuery = function(q) {
    this._query = q
  }
   
 }


let store = new Store();
// renderApp(app);
function renderItem(item) {
   let dv = document.createElement('div');
   dv.classList.add("item")
   let item_copy = {
       'image': item.image,
       'name' : item.name,
       'description': item.description,
       'dateLastEdited': item.dateLastEdited
   }
   for (let k of Object.keys(item_copy)) {
     let div = document.createElement('div')
     if(k == 'image') {
         div = document.createElement('img');
         div.src = item[k];
         div.classList.add('item-image');
     }
     else{
        let text = item[k]
        let query = store.query()
        let lquery = store.query().toLowerCase();
        if (store.query() && item[k].toLowerCase().includes(lquery)){
          let reg = new RegExp(query, "i");
          let replaces = text.match(reg)
          for (rep of replaces) {
            text = text.toString().replaceAll(rep, `<span class='item-query-text'>${rep}</span>`)
          }
        }
        div.innerHTML = text
    //   div.innerText = item[k]
     }
     div.classList.add(`item-${k}`)
  //    div.innerText = item[k]
     dv.appendChild(div)
   }
   return dv

}
function setTableHeader(columns) {
   let thead = document.createElement('thead')
   for (let col of columns) {
       let th = document.createElement('th')
       th.innerText = col
       thead.appendChild(th)
   }
   return thead
}

function setTableBody(data) {
   let tbody = document.createElement('tbody')
   for (let item of data) {
       let tr = document.createElement('tr')
       for (let k of Object.keys(item)) {
           let td = document.createElement('td')
           td.innerText = item[k]
           tr.appendChild(td)
       }
       tbody.appendChild(tr)
   }
   return tbody

}
function renderTable(app) {
   let header = []
   if (store.items().length) {
     headers = Object.keys(store.items()[0])
   }else{
     headers = ["Name", "Description", "DateLastEdited"]
   }
   let table = document.createElement('table')
   table.appendChild(setTableHeader(headers))
   table.append(setTableBody(store.items()))
   app.append(table)

}

function renderGrid(app) {
   app.innerHTML = ""
   for (let item of store.items()) {
       app.append(renderItem(item))
   }
}
 
function renderApp(app) {
   renderGrid(app)
   renderTable(app)
   setHistoryData(store)
}
// const app = document.getElementById("app")
 
function setHistoryData(store) {
   const query_input = document.getElementById("query");
   const filter_select = document.getElementById("filter");
   let prev_query = store.getItem(query_input.name) || "";
   let prev_filter = store.getItem(filter_select.name) || "";

   query_input.dataset.lastsearch = prev_query;
   filter_select.dataset.lastfilter = prev_filter;

}

function setHistoryChips() {
 const query_input = document.getElementById("query");
 const filter_select = document.getElementById("filter");
 const history_container = document.getElementById("history")
 const query_label = document.createElement('div')
 const filter_label = document.createElement('div')
 let query_chip = document.createElement('span')
 let filter_chip = document.createElement('span')
 query_chip.classList.add('query-chip')
 filter_chip.classList.add('filter-chip')
 query_label.innerText = "Last Search: "
 filter_label.innerText = "Last Filter: "
 query_chip.innerText = query_input.dataset.lastsearch;
 filter_chip.innerText = filter_select.dataset.lastfilter
 query_label.appendChild(query_chip)
 filter_label.appendChild(filter_chip)
 history_container.appendChild(query_label)
 history_container.appendChild(filter_label)
}

function populateFilterOptions(data) {
 const select = document.getElementById('filter')
 select.innerHTML = "";
 const null_option = document.createElement("option");
 null_option.value = "-1"
 null_option.innerText = "Filter by"
 select.appendChild(null_option);
 if(data.length) {
   let dp = data[0]
   for (let k of Object.keys(dp)) {
     let option = document.createElement('option')
     option.value = k.toString();
     option.innerText = k.toString()[0].toUpperCase() + k.toString().slice(1);
     select.appendChild(option)
   }
 }
}
window.addEventListener('DOMContentLoaded', (event) => {
   setHistoryChips();
   populateFilterOptions(store.items())
});


renderApp(app);
 

function Paginator(object) {
  this.object = object
  this.pages = []
  this._current = 1
  this._next = 1
  this._previous = 1
  this._last = 1
  this._container_id = 'pagination'
  this._container = null
  this._paginator_class = "easy-paginator"
  this._step_class = "easy-paginator-step"
  this._current_class = "current"
  this._step_cb = null
  this._step = 10

  this.is_object_safe = function() {
      return Symbol.iterator in Object(this.object)
  }
  this.init = function() {
      this.is_object_safe() ? this.config() : this.error()
  }
  this.config = function() {
      this.pages = object
      this._container_id = "pagination"
      this._current = 1
      this.render();
  }
  this.error = function() {
      throw 'Invalid paginator configuration.'
  }
  this.count = function() {
      return this.pages.length
  }
  this.last = function() {
      return this.count()
  }
  this.current = function() {
      return this._current;
  }
  this.next = function() {
      this._current += 1;
      return this._current
  }
  this.previous = function() {
      this._current -= 1
      return this._current
  }
  this.container = function() {
      this._container = document.getElementById(this._container_id)
      if (!this._container) {
          this._container = document.createElement('div')
      }
      return this._container
  }

  this.render = function() {
      let p = document.createElement('div')
      p.classList.add(this._paginator_class)
      this.container().innerHTML = "";
      for (let i=1; i<= this.count(); i+=this._step) {
          console.log("rendering pagination")
          let step = document.createElement('a')
          step.classList.add(this._step_class)
          page = Math.ceil(i / this._step);
          step.dataset.page = page
          let start = (page * this._step) - this._step
          step.dataset.start = start
          step.dataset.end = start + this._step
          if (this.current() == page) {
              step.classList.add(this._current_class)
          }
          step.innerText = page;
          step.addEventListener('click', this.step_cb);
          p.appendChild(step)
      }
      this.container().appendChild(p)
  }

  this.step_cb = (ev) => {
      let curr = ev.target.dataset.page
      this._current = curr
      let items = this.page(ev.target.dataset.start, ev.target.dataset.end)
      store.hookPageChange(items)
      renderApp(app)
      this.render()
  }

  this.page = function(start=0, end=this._step) {
    return this.object.slice(start,end)
  }

  this.init();

}
  

const query_input = document.getElementById("query");
const filter_select = document.getElementById("filter");
query_input.addEventListener('keyup', function(e) {
   if (this.value.trim().length > 0) {
       store.search(this.name, this.value)
       
   }else{
       store.init();
       store.setQuery("")
   }
   renderApp(app)
});
filter_select.addEventListener('change', function(e) {
   if (this.value != '-1') {
       store.sort(this.name, this.value)
   }else{
       store.init();
   }
   renderApp(app)
});