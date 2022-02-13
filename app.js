
function fetchItems() {
  let items = JSON.parse(data);
  return items
}

function Store() {
   
   this._original_items = fetchItems();
   this._store = window.localStorage;
   this._items = this._original_items;
   
   this.init = function() {
       this._items = fetchItems();
       this.items();
   }
   this.items = function() {
     return this._items;
   }
   
   this.search = function(type, query) {
     this.setItem(type, query)
     // search logic here
     this.init();
     this._items = this._items.filter(item => item.name.includes(query) || item.description.includes(query))
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
   
 }

let store = new Store();
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
      div.innerText = item[k]
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
const app = document.getElementById("app")
 
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
 
const query_input = document.getElementById("query");
const filter_select = document.getElementById("filter");
query_input.addEventListener('keyup', function(e) {
   if (this.value.trim().length >= 1) {
       store.search(this.name, this.value)
       
   }else{
       store.init();
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