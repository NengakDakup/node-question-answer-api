const express = require('express');
const mongoose = require('mongoose');

// Load Question Model
const Notification = require('../models/Notification');
const Pointer = require('./Pointer');

const notify = (triggeredById, triggeredByName, reaction, type, slug, triggeredFor) => {
  if(triggeredById.toString() === triggeredFor.toString() && reaction !== 'Approved') return console.log('uihiuhj');
  let notifyFields = {};
  notifyFields.user = triggeredFor;
  notifyFields.triggeredBy = triggeredById;
  if(reaction !== 'Followed') notifyFields.title = triggeredByName + ' ' + reaction + ' your' + ' ' + type;
  if(reaction === 'Followed') notifyFields.title = triggeredByName + ' ' + reaction + ' you';
  if(reaction === 'Commented') notifyFields.title = triggeredByName + ' ' + reaction + ' on your' + ' ' + type;
  notifyFields.reaction = reaction;
  if(slug && reaction !== 'Followed') notifyFields.link = 'question/' + slug;
  if(slug && reaction === 'Followed') notifyFields.link = 'user/' + triggeredById;

  new Notification(notifyFields).save()
    .then(notification => {
      Pointer();
      return notification;
    })
  // Notification.findOne({title: notifyFields.title})
  //   .then(notification => {
  //     if(notification){
  //       return null;
  //     } else {
  //       new Notification(notifyFields).save()
  //         .then(notification => {
  //           return notification;
  //         })
  //     }
  //   })
}

module.exports = notify;
