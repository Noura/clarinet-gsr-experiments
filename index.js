var h = require('virtual-dom/h')
var EE = require('events').EventEmitter

function declare (fn, store) {
  var ml = require('main-loop')
  var l = ml(store, fn, require('virtual-dom'))
  document.querySelector('#app').appendChild(l.target)
  return l
}

var dispatcher = new EE()

// STATE
var store = {
  n: 0
}

// VIEW
function render (state) {

  return h('div', [
    h('h1', `clicked ${state.n} times`),
    h('button', { onclick: handleClick }, 'click me!')
  ])

  function handleClick (ev) {
    dispatcher.emit('button-click', ev)
  }

}

// ACTIONS
function actions (loop) {
  dispatcher.on('button-click', (ev) => {
    store.n = store.n+1 
    loop.update(store)
  })
}



var loop = declare(render, store)
actions(loop)

