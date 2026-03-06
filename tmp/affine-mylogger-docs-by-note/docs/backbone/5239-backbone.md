---
mylogger_id: 5239
tags: [backbone]
added: "2014-05-29 11:04:34"
source: mylogger
---

# Note 5239

Tags: #backbone

Events
Binding events to functions
All: this event gets triggered when any event occures
If you have a large number of different events on a page, the convention is to use colons to namespace them: "poll:start", or "change:selection"
Event map syntax, as an alternative to positional arguments("change:title": titleView.update, "change:author": authorPane.update)
onobject.on(event, callback, [context])Alias: bind 
offobject.off([event], [callback], [context])Alias: unbind 
Note that calling model.off(), for example, will indeed remove all events on the model — including events that Backbone uses for internal bookkeeping.
triggerobject.trigger(event, [*args]) 
listenToobject.listenTo(other, event, callback) 
stopListeningobject.stopListening([other], [event], [callback]) 
If you'd like to prevent the event from being triggered, you may pass {silent: true} as an option. Note that this is rare

Objects
If you define an initialize function, it will be invoked when the model is created.
The defaults hash (or function) can be used to specify the default attributes for your model. 
syncmodel.sync(method, model, [options]) Uses Backbone.sync to persist the state of a model to the server. Can be overridden for custom behavior.
fetchmodel.fetch([options]) 
If instead, you'd only like the changed attributes to be sent to the server, call model.save(attrs, {patch: true}). You'll get an HTTP PATCH request to the server with just the passed-in attributes.
save accepts success and error callbacks in the options hash
Generates URLs of the form: "[collection.url]/[id]" by default, but you may override by specifying an explicit urlRoot if the model's collection shouldn't be taken into account.



Collections
Add into collection {at: index}  {merge: true}
Pluck name, find friends.where({job:"Musketeer"}), findWhere return the first model found with matching data.
Fetch, Sync

Views
You can bind your view's render function to the model's "change" event — and now everywhere that model data is displayed in the UI, it is always immediately up to date.
There are several special options that, if passed, will be attached directly to the view: model, collection, el, id, className, tagName, attributes and events. 
If the view defines an initialize function, it will be called when the view is first created.
