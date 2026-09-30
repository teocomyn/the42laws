(function(root){
 'use strict';
 const KEY='the42laws:v1';
 function read(storage=root.localStorage){return root.AtlasCore.cleanState(JSON.parse(storage.getItem(KEY)||'{}'));}
 function update(patch,storage=root.localStorage){const current=read(storage);const next=root.AtlasCore.cleanState(patch(current));storage.setItem(KEY,JSON.stringify(next));return next;}
 root.AtlasNotebook={KEY,read,update};
})(globalThis);
