/*!
 *  howler.js v1.1.11
 *  howlerjs.com
 *
 *  (c) 2013, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {
  // setup
  var cache = {};

  // setup the audio context
  var ctx = null,
    usingWebAudio = true,
    noAudio = false;
  if (typeof AudioContext !== 'undefined') {
    ctx = new AudioContext();
  } else if (typeof webkitAudioContext !== 'undefined') {
    ctx = new webkitAudioContext();
  } else if (typeof Audio !== 'undefined') {
    usingWebAudio = false;
  } else {
    usingWebAudio = false;
    noAudio = true;
  }

  // create a master gain node
  if (usingWebAudio) {
    var masterGain = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }

  // create global controller
  var HowlerGlobal = function() {
    this._volume = 1;
    this._muted = false;
    this.usingWebAudio = usingWebAudio;
    this._howls = [];
  };
  // HowlerGlobal.prototype = {
  //   /**
  //    * Get/set the global volume for all sounds.
  //    * @param  {Float} vol Volume from 0.0 to 1.0.
  //    * @return {Howler/Float}     Returns self or current volume.
  //    */
  //   volume: function(vol) {
  //     var self = this;

  //     // make sure volume is a number
  //     vol = parseFloat(vol);

  //     if (vol && vol >= 0 && vol <= 1) {
  //       self._volume = vol;

  //       if (usingWebAudio) {
  //         masterGain.gain.value = vol;
  //       }

  //       // loop through cache and change volume of all nodes that are using HTML5 Audio
  //       for (var key in self._howls) {
  //         if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
  //           // loop through the audio nodes
  //           for (var i=0; i<self._howls[key]._audioNode.length; i++) {
  //             self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume;
  //           }
  //         }
  //       }

  //       return self;
  //     }

  //     // return the current global volume
  //     return (usingWebAudio) ? masterGain.gain.value : self._volume;
  //   },

  //   /**
  //    * Mute all sounds.
  //    * @return {Howler}
  //    */
  //   mute: function() {
  //     this._setMuted(true);

  //     return this;
  //   },

  //   /**
  //    * Unmute all sounds.
  //    * @return {Howler}
  //    */
  //   unmute: function() {
  //     this._setMuted(false);

  //     return this;
  //   },

  //   /**
  //    * Handle muting and unmuting globally.
  //    * @param  {Boolean} muted Is muted or not.
  //    */
  //   _setMuted: function(muted) {
  //     var self = this;

  //     self._muted = muted;

  //     if (usingWebAudio) {
  //       masterGain.gain.value = muted ? 0 : self._volume;
  //     }

  //     for (var key in self._howls) {
  //       if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
  //         // loop through the audio nodes
  //         for (var i=0; i<self._howls[key]._audioNode.length; i++) {
  //           self._howls[key]._audioNode[i].muted = muted;
  //         }
  //       }
  //     }
  //   }
  // };

  // allow access to the global audio controls
  var Howler = new HowlerGlobal();

  // check for browser codec support
  var audioTest = null;
  if (!noAudio) {
    audioTest = new Audio();
    var codecs = {
      mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/,''),
      opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,''),
      ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,''),
      wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/,''),
      m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/,''),
      webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,'')
    };
  }

  // setup the audio object
  var Howl = function(o) {
    var self = this;

    // setup the defaults
    self._autoplay = o.autoplay || false;
    self._buffer = o.buffer || false;
    self._duration = o.duration || 0;
    self._format = o.format || null;
    self._loop = o.loop || false;
    self._loaded = false;
    self._sprite = o.sprite || {};
    self._src = o.src || '';
    self._pos3d = o.pos3d || [0, 0, -0.5];
    self._volume = o.volume || 1;
    self._urls = o.urls || [];

    // setup event functions
    self._onload = [o.onload || function() {}];
    self._onloaderror = [o.onloaderror || function() {}];
    self._onend = [o.onend || function() {}];
    self._onpause = [o.onpause || function() {}];
    self._onplay = [o.onplay || function() {}];

    self._onendTimer = [];

    // Web Audio or HTML5 Audio?
    self._webAudio = usingWebAudio && !self._buffer;

    // check if we need to fall back to HTML5 Audio
    self._audioNode = [];
    if (self._webAudio) {
      self._setupAudioNode();
    }

    // add this to an array of Howl's to allow global control
    Howler._howls.push(self);

    // load the track
    self.load();
  };

  // setup all of the methods
  Howl.prototype = {
    /**
     * Load an audio file.
     * @return {Howl}
     */
    load: function() {
      var self = this,
        url = null;

      // if no audio is available, quit immediately
      if (noAudio) {
        self.on('loaderror');
        return;
      }

      var canPlay = {
        mp3: codecs.mp3,
        opus: codecs.opus,
        ogg: codecs.ogg,
        wav: codecs.wav,
        m4a: codecs.m4a,
        weba: codecs.webm
      };

      // loop through source URLs and pick the first one that is compatible
      for (var i=0; i<self._urls.length; i++) {
        var ext;

        if (self._format) {
          // use specified audio format if available
          ext = self._format;
        } else {
          // figure out the filetype (whether an extension or base64 data)
          ext = self._urls[i].toLowerCase().match(/.+\.([^?]+)(\?|$)/);
          ext = (ext && ext.length >= 2) ? ext[1] : self._urls[i].toLowerCase().match(/data\:audio\/([^?]+);/)[1];
        }

        if (canPlay[ext]) {
          url = self._urls[i];
          break;
        }
      }

      if (!url) {
        self.on('loaderror');
        return;
      }

      self._src = url;

      if (self._webAudio) {
        loadBuffer(self, url);
      } else {
        var newNode = new Audio();
        self._audioNode.push(newNode);

        // setup the new audio node
        newNode.src = url;
        newNode._pos = 0;
        newNode.preload = 'auto';

        // add this sound to the cache
        cache[url] = self;

        // setup the event listener to start playing the sound
        // as soon as it has buffered enough
        var listener = function() {
          self._duration = newNode.duration;

          // setup a sprite if none is defined
          if (Object.getOwnPropertyNames(self._sprite).length === 0) {
            self._sprite = {_default: [0, self._duration * 1000]};
          }

          if (!self._loaded) {
            self._loaded = true;
            self.on('load');
          }

          if (self._autoplay) {
            self.play();
          }

          // clear the event listener
          newNode.removeEventListener('canplaythrough', listener, false);
        };
        newNode.addEventListener('canplaythrough', listener, false);
        newNode.load();
      }

      return self;
    },

    /**
     * Get/set the URLs to be pulled from to play in this source.
     * @param  {Array} urls  Arry of URLs to load from
     * @return {Howl}        Returns self or the current URLs
     */
    // urls: function(urls) {
    //   var self = this;

    //   if (urls) {
    //     self.stop();
    //     self._urls = (typeof urls === 'string') ? [urls] : urls;
    //     self._loaded = false;
    //     self.load();

    //     return self;
    //   } else {
    //     return self._urls;
    //   }
    // },

    /**
     * Play a sound from the current time (0 by default).
     * @param  {String}   sprite   (optional) Plays from the specified position in the sound sprite definition.
     * @param  {Function} callback (optional) Returns the unique playback id for this sound instance.
     * @return {Howl}
     */
    play: function(sprite, callback) {
      var self = this;

      // if no sprite was passed but a callback was, update the variables
      if (typeof sprite === 'function') {
        callback = sprite;
      }

      // use the default sprite if none is passed
      if (!sprite || typeof sprite === 'function') {
        sprite = '_default';
      }

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.play(sprite, callback);
        });

        return self;
      }

      // if the sprite doesn't exist, play nothing
      if (!self._sprite[sprite]) {
        if (typeof callback === 'function') callback();
        return self;
      }

      // get the node to playback
      self._inactiveNode(function(node) {
        // persist the sprite being played
        node._sprite = sprite;

        // determine where to start playing from
        var pos = (node._pos > 0) ? node._pos : self._sprite[sprite][0] / 1000,
          duration = self._sprite[sprite][1] / 1000 - node._pos;

        // determine if this sound should be looped
        var loop = !!(self._loop || self._sprite[sprite][2]);

        // set timer to fire the 'onend' event
        var soundId = (typeof callback === 'string') ? callback : Math.round(Date.now() * Math.random()) + '',
          timerId;
        (function() {
          var data = {
            id: soundId,
            sprite: sprite,
            loop: loop
          };
          timerId = setTimeout(function() {
            // if looping, restart the track
            if (!self._webAudio && loop) {
              self.stop(data.id, data.timer).play(sprite, data.id);
            }

            // set web audio node to paused at end
            if (self._webAudio && !loop) {
              self._nodeById(data.id).paused = true;
            }

            // end the track if it is HTML audio and a sprite
            if (!self._webAudio && !loop) {
              self.stop(data.id, data.timer);
            }

            // fire ended event
            self.on('end', soundId);
          }, duration * 1000);

          // store the reference to the timer
          self._onendTimer.push(timerId);

          // remember which timer to cancel
          data.timer = self._onendTimer[self._onendTimer.length - 1];
        })();

        if (self._webAudio) {
          var loopStart = self._sprite[sprite][0] / 1000,
            loopEnd = self._sprite[sprite][1] / 1000;

          // set the play id to this node and load into context
          node.id = soundId;
          node.paused = false;
          refreshBuffer(self, [loop, loopStart, loopEnd], soundId);
          self._playStart = ctx.currentTime;
          // node.gain.value = self._volume;

          if (typeof node.bufferSource.start === 'undefined') {
            node.bufferSource.noteGrainOn(0, pos, duration);
          } else {
            node.bufferSource.start(0, pos, duration);
          }
        } else {
          if (node.readyState === 4) {
            node.id = soundId;
            node.currentTime = pos;
            node.muted = Howler._muted;
            // node.volume = self._volume * Howler.volume();
            setTimeout(function() { node.play(); }, 0);
          } else {
            self._clearEndTimer(timerId);

            (function(){
              var sound = self,
                playSprite = sprite,
                fn = callback,
                newNode = node;
              var listener = function() {
                sound.play(playSprite, fn);

                // clear the event listener
                newNode.removeEventListener('canplaythrough', listener, false);
              };
              newNode.addEventListener('canplaythrough', listener, false);
            })();

            return self;
          }
        }

        // fire the play event and send the soundId back in the callback
        self.on('play');
        if (typeof callback === 'function') callback(soundId);

        return self;
      });

      return self;
    },

    /**
     * Pause playback and save the current position.
     * @param {String} id (optional) The play instance ID.
     * @param {String} timerId (optional) Clear the correct timeout ID.
     * @return {Howl}
     */
    // pause: function(id, timerId) {
    //   var self = this;

    //   // if the sound hasn't been loaded, add it to the event queue
    //   if (!self._loaded) {
    //     self.on('play', function() {
    //       self.pause(id);
    //     });

    //     return self;
    //   }

    //   // clear 'onend' timer
    //   self._clearEndTimer(timerId || 0);

    //   var activeNode = (id) ? self._nodeById(id) : self._activeNode();
    //   if (activeNode) {
    //     activeNode._pos = self.pos(null, id);

    //     if (self._webAudio) {
    //       // make sure the sound has been created
    //       if (!activeNode.bufferSource) {
    //         return self;
    //       }

    //       activeNode.paused = true;
    //       if (typeof activeNode.bufferSource.stop === 'undefined') {
    //         activeNode.bufferSource.noteOff(0);
    //       } else {
    //         activeNode.bufferSource.stop(0);
    //       }
    //     } else {
    //       activeNode.pause();
    //     }
    //   }

    //   self.on('pause');

    //   return self;
    // },

    /**
     * Stop playback and reset to start.
     * @param  {String} id  (optional) The play instance ID.
     * @param  {String} timerId  (optional) Clear the correct timeout ID.
     * @return {Howl}
     */
    stop: function(id, timerId) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.stop(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(timerId || 0);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = 0;

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource) {
            return self;
          }

          activeNode.paused = true;

          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else {
          activeNode.pause();
          activeNode.currentTime = 0;
        }
      }

      return self;
    },

    /**
     * Mute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    // mute: function(id) {
    //   var self = this;

    //   // if the sound hasn't been loaded, add it to the event queue
    //   if (!self._loaded) {
    //     self.on('play', function() {
    //       self.mute(id);
    //     });

    //     return self;
    //   }

    //   var activeNode = (id) ? self._nodeById(id) : self._activeNode();
    //   if (activeNode) {
    //     if (self._webAudio) {
    //       activeNode.gain.value = 0;
    //     } else {
    //       activeNode.volume = 0;
    //     }
    //   }

    //   return self;
    // },

    /**
     * Unmute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    // unmute: function(id) {
    //   var self = this;

    //   // if the sound hasn't been loaded, add it to the event queue
    //   if (!self._loaded) {
    //     self.on('play', function() {
    //       self.unmute(id);
    //     });

    //     return self;
    //   }

    //   var activeNode = (id) ? self._nodeById(id) : self._activeNode();
    //   if (activeNode) {
    //     if (self._webAudio) {
    //       activeNode.gain.value = self._volume;
    //     } else {
    //       activeNode.volume = self._volume;
    //     }
    //   }

    //   return self;
    // },

    /**
     * Get/set volume of this sound.
     * @param  {Float}  vol Volume from 0.0 to 1.0.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}     Returns self or current volume.
     */
    // volume: function(vol, id) {
    //   var self = this;

    //   // make sure volume is a number
    //   vol = parseFloat(vol);

    //   if (vol >= 0 && vol <= 1) {
    //     self._volume = vol;

    //     // if the sound hasn't been loaded, add it to the event queue
    //     if (!self._loaded) {
    //       self.on('play', function() {
    //         self.volume(vol, id);
    //       });

    //       return self;
    //     }

    //     var activeNode = (id) ? self._nodeById(id) : self._activeNode();
    //     if (activeNode) {
    //       if (self._webAudio) {
    //         activeNode.gain.value = vol;
    //       } else {
    //         activeNode.volume = vol * Howler.volume();
    //       }
    //     }

    //     return self;
    //   } else {
    //     return self._volume;
    //   }
    // },

    /**
     * Get/set whether to loop the sound.
     * @param  {Boolean} loop To loop or not to loop, that is the question.
     * @return {Howl/Boolean}      Returns self or current looping value.
     */
    loop: function(loop) {
      var self = this;

      if (typeof loop === 'boolean') {
        self._loop = loop;

        return self;
      } else {
        return self._loop;
      }
    },

    /**
     * Get/set sound sprite definition.
     * @param  {Object} sprite Example: {spriteName: [offset, duration, loop]}
     *                @param {Integer} offset   Where to begin playback in milliseconds
     *                @param {Integer} duration How long to play in milliseconds
     *                @param {Boolean} loop     (optional) Set true to loop this sprite
     * @return {Howl}        Returns current sprite sheet or self.
     */
    sprite: function(sprite) {
      var self = this;

      if (typeof sprite === 'object') {
        self._sprite = sprite;

        return self;
      } else {
        return self._sprite;
      }
    },

    /**
     * Get/set the position of playback.
     * @param  {Float}  pos The position to move current playback to.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}      Returns self or current playback position.
     */
    // pos: function(pos, id) {
    //   var self = this;

    //   // if the sound hasn't been loaded, add it to the event queue
    //   if (!self._loaded) {
    //     self.on('load', function() {
    //       self.pos(pos);
    //     });

    //     return typeof pos === 'number' ? self : self._pos || 0;
    //   }

    //   // make sure we are dealing with a number for pos
    //   pos = parseFloat(pos);

    //   var activeNode = (id) ? self._nodeById(id) : self._activeNode();
    //   if (activeNode) {
    //     if (self._webAudio) {
    //       if (pos >= 0) {
    //         activeNode._pos = pos;
    //         self.pause(id).play(activeNode._sprite, id);

    //         return self;
    //       } else {
    //         return activeNode._pos + (ctx.currentTime - self._playStart);
    //       }
    //     } else {
    //       if (pos >= 0) {
    //         activeNode.currentTime = pos;

    //         return self;
    //       } else {
    //         return activeNode.currentTime;
    //       }
    //     }
    //   } else if (pos >= 0) {
    //     return self;
    //   } else {
    //     // find the first inactive node to return the pos for
    //     for (var i=0; i<self._audioNode.length; i++) {
    //       if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
    //         return (self._webAudio) ? self._audioNode[i]._pos : self._audioNode[i].currentTime;
    //       }
    //     }
    //   }
    // },

    /**
     * Get/set the 3D position of the audio source.
     * The most common usage is to set the 'x' position
     * to affect the left/right ear panning. Setting any value higher than
     * 1.0 will begin to decrease the volume of the sound as it moves further away.
     * NOTE: This only works with Web Audio API, HTML5 Audio playback
     * will not be affected.
     * @param  {Float}  x  The x-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  y  The y-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  z  The z-position of the playback from -1000.0 to 1000.0
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl/Array}   Returns self or the current 3D position: [x, y, z]
     */
    pos3d: function(x, y, z, id) {
      // var self = this;

      // // set a default for the optional 'y' & 'z'
      // y = (typeof y === 'undefined' || !y) ? 0 : y;
      // z = (typeof z === 'undefined' || !z) ? -0.5 : z;

      // // if the sound hasn't been loaded, add it to the event queue
      // if (!self._loaded) {
      //   self.on('play', function() {
      //     self.pos3d(x, y, z, id);
      //   });

      //   return self;
      // }

      // if (x >= 0 || x < 0) {
      //   if (self._webAudio) {
      //     var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      //     if (activeNode) {
      //       self._pos3d = [x, y, z];
      //       activeNode.panner.setPosition(x, y, z);
      //     }
      //   }
      // } else {
      //   return self._pos3d;
      // }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes.
     * @param  {Number}   from     The volume to fade from (0.0 to 1.0).
     * @param  {Number}   to       The volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback (optional) Fired when the fade is complete.
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    // fade: function(from, to, len, callback, id) {
    //   var self = this,
    //     diff = Math.abs(from - to),
    //     dir = from > to ? 'down' : 'up',
    //     steps = diff / 0.01,
    //     stepTime = len / steps;

    //   // if the sound hasn't been loaded, add it to the event queue
    //   if (!self._loaded) {
    //     self.on('load', function() {
    //       self.fade(from, to, len, callback, id);
    //     });

    //     return self;
    //   }

    //   // set the volume to the start position
    //   self.volume(from, id);

    //   for (var i=1; i<=steps; i++) {
    //     (function() {
    //       var change = self._volume + (dir === 'up' ? 0.01 : -0.01) * i,
    //         vol = Math.round(1000 * change) / 1000,
    //         toVol = to;

    //       setTimeout(function() {
    //         self.volume(vol, id);

    //         if (vol === toVol) {
    //           if (callback) callback();
    //         }
    //       }, stepTime * i);
    //     })();
    //   }
    // },

    // *
    //  * [DEPRECATED] Fade in the current sound.
    //  * @param  {Float}    to      Volume to fade to (0.0 to 1.0).
    //  * @param  {Number}   len     Time in milliseconds to fade.
    //  * @param  {Function} callback
    //  * @return {Howl}

    // fadeIn: function(to, len, callback) {
    //   return this.volume(0).play().fade(0, to, len, callback);
    // },

    // /**
    //  * [DEPRECATED] Fade out the current sound and pause when finished.
    //  * @param  {Float}    to       Volume to fade to (0.0 to 1.0).
    //  * @param  {Number}   len      Time in milliseconds to fade.
    //  * @param  {Function} callback
    //  * @param  {String}   id       (optional) The play instance ID.
    //  * @return {Howl}
    //  */
    // fadeOut: function(to, len, callback, id) {
    //   var self = this;

    //   return self.fade(self._volume, to, len, function() {
    //     if (callback) callback();
    //     self.pause(id);

    //     // fire ended event
    //     self.on('end');
    //   }, id);
    // },

    /**
     * Get an audio node by ID.
     * @return {Howl} Audio node.
     */
    _nodeById: function(id) {
      var self = this,
        node = self._audioNode[0];

      // find the node with this ID
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].id === id) {
          node = self._audioNode[i];
          break;
        }
      }

      return node;
    },

    /**
     * Get the first active audio node.
     * @return {Howl} Audio node.
     */
    _activeNode: function() {
      var self = this,
        node = null;

      // find the first playing node
      for (var i=0; i<self._audioNode.length; i++) {
        if (!self._audioNode[i].paused) {
          node = self._audioNode[i];
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      return node;
    },

    /**
     * Get the first inactive audio node.
     * If there is none, create a new one and add it to the pool.
     * @param  {Function} callback Function to call when the audio node is ready.
     */
    _inactiveNode: function(callback) {
      var self = this,
        node = null;

      // find first inactive node to recycle
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
          callback(self._audioNode[i]);
          node = true;
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      if (node) {
        return;
      }

      // create new node if there are no inactives
      var newNode;
      if (self._webAudio) {
        newNode = self._setupAudioNode();
        callback(newNode);
      } else {
        self.load();
        newNode = self._audioNode[self._audioNode.length - 1];
        newNode.addEventListener('loadedmetadata', function() {
          callback(newNode);
        });
      }
    },

    /**
     * If there are more than 5 inactive audio nodes in the pool, clear out the rest.
     */
    _drainPool: function() {
      var self = this,
        inactive = 0,
        i;

      // count the number of inactive nodes
      for (i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused) {
          inactive++;
        }
      }

      // remove excess inactive nodes
      for (i=self._audioNode.length-1; i>=0; i--) {
        if (inactive <= 5) {
          break;
        }

        if (self._audioNode[i].paused) {
          // disconnect the audio source if using Web Audio
          if (self._webAudio) {
            self._audioNode[i].disconnect(0);
          }

          inactive--;
          self._audioNode.splice(i, 1);
        }
      }
    },

    /**
     * Clear 'onend' timeout before it ends.
     * @param  {Number} timerId The ID of the sound to be cancelled.
     */
    _clearEndTimer: function(timerId) {
      var self = this,
        timer = self._onendTimer.indexOf(timerId);

      // make sure the timer gets cleared
      timer = timer >= 0 ? timer : 0;

      if (self._onendTimer[timer]) {
        clearTimeout(self._onendTimer[timer]);
        self._onendTimer.splice(timer, 1);
      }
    },

    /**
     * Setup the gain node and panner for a Web Audio instance.
     * @return {Object} The new audio node.
     */
    _setupAudioNode: function() {
      var self = this,
        node = self._audioNode,
        index = self._audioNode.length;

      // create gain node
      node[index] = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
      // node[index].gain.value = self._volume;
      node[index].paused = true;
      node[index]._pos = 0;
      node[index].readyState = 4;
      node[index].connect(masterGain);

      // create the panner
      node[index].panner = ctx.createPanner();
      node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]);
      node[index].panner.connect(node[index]);

      return node[index];
    },

    /**
     * Call/set custom events.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Function to call.
     * @return {Howl}
     */
    on: function(event, fn) {
      var self = this,
        events = self['_on' + event];

      if (typeof fn === "function") {
        events.push(fn);
      } else {
        for (var i=0; i<events.length; i++) {
          if (fn) {
            events[i].call(self, fn);
          } else {
            events[i].call(self);
          }
        }
      }

      return self;
    },

    /**
     * Remove a custom event.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Listener to remove.
     * @return {Howl}
     */
    off: function(event, fn) {
      var self = this,
        events = self['_on' + event],
        fnString = fn.toString();

      // loop through functions in the event for comparison
      for (var i=0; i<events.length; i++) {
        if (fnString === events[i].toString()) {
          events.splice(i, 1);
          break;
        }
      }

      return self;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all play instances attached to this sound.
     */
    unload: function() {
      // var self = this;

      // // stop playing any active nodes
      // var nodes = self._audioNode;
      // for (var i=0; i<self._audioNode.length; i++) {
      //   self.stop(nodes[i].id);

      //   if (!self._webAudio) {
      //      // remove the source if using HTML5 Audio
      //     nodes[i].src = '';
      //   } else {
      //     // disconnect the output from the master gain
      //     nodes[i].disconnect(0);
      //   }
      // }

      // // remove the reference in the global Howler object
      // var index = Howler._howls.indexOf(self);
      // if (index) {
      //   Howler._howls.splice(index, 1);
      // }

      // // delete this sound from the cache
      // delete cache[self._src];
      // self = null;
    }

  };

  // only define these functions when using WebAudio
  if (usingWebAudio) {

    /**
     * Buffer a sound from URL (or from cache) and decode to audio source (Web Audio API).
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var loadBuffer = function(obj, url) {
      // check if the buffer has already been cached
      if (url in cache) {
        // set the duration from the cache
        obj._duration = cache[url].duration;

        // load the sound into this object
        loadSound(obj);
      } else {
        // load the buffer from the URL
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          // decode the buffer into an audio source
          ctx.decodeAudioData(xhr.response, function(buffer) {
            if (buffer) {
              cache[url] = buffer;
              loadSound(obj, buffer);
            }
          });
        };
        xhr.onerror = function() {
          // if there is an error, switch the sound to HTML Audio
          if (obj._webAudio) {
            obj._buffer = true;
            obj._webAudio = false;
            obj._audioNode = [];
            delete obj._gainNode;
            obj.load();
          }
        };
        try {
          xhr.send();
        } catch (e) {
          xhr.onerror();
        }
      }
    };

    /**
     * Finishes loading the Web Audio API sound and fires the loaded event
     * @param  {Object}  obj    The Howl object for the sound to load.
     * @param  {Objecct} buffer The decoded buffer sound source.
     */
    var loadSound = function(obj, buffer) {
      // set the duration
      obj._duration = (buffer) ? buffer.duration : obj._duration;

      // setup a sprite if none is defined
      if (Object.getOwnPropertyNames(obj._sprite).length === 0) {
        obj._sprite = {_default: [0, obj._duration * 1000]};
      }

      // fire the loaded event
      if (!obj._loaded) {
        obj._loaded = true;
        obj.on('load');
      }

      if (obj._autoplay) {
        obj.play();
      }
    };

    /**
     * Load the sound back into the buffer source.
     * @param  {Object} obj   The sound to load.
     * @param  {Array}  loop  Loop boolean, pos, and duration.
     * @param  {String} id    (optional) The play instance ID.
     */
    var refreshBuffer = function(obj, loop, id) {
      // determine which node to connect to
      var node = obj._nodeById(id);

      // setup the buffer source for playback
      node.bufferSource = ctx.createBufferSource();
      node.bufferSource.buffer = cache[obj._src];
      node.bufferSource.connect(node.panner);
      node.bufferSource.loop = loop[0];
      if (loop[0]) {
        node.bufferSource.loopStart = loop[1];
        node.bufferSource.loopEnd = loop[1] + loop[2];
      }
    };

  }

  /**
   * Add support for AMD (Async Module Definition) libraries such as require.js.
   */
  if (typeof define === 'function' && define.amd) {
    define('Howler', function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  } else {
    window.Howler = Howler;
    window.Howl = Howl;
  }
})();
;/**
 * requestAnimationFrame函数
 * @param  {[type]} window [description]
 * @return {[type]}        [description]
 */
(function(window) {
    if (window.requestAnimationFrame) {
        return;
    }
    var i = 0,
        lastTime = 0,
        vendors = ['webkit', 'moz', 'ms', 'o'],
        len = vendors.length;

    while (i < len && !window.requestAnimationFrame) {
        window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'];
        i++;
    }

    if (!window.requestAnimationFrame) {
        var fps = 60;//设置为80帧
        var everyTime = 1000 / fps;
        window.requestAnimationFrame = function(callback, element) {
            var currTime = Date.now(),
                timeToCall = Math.max(0, everyTime - currTime + lastTime),
                id = setTimeout(function() {
                    callback();
                }, timeToCall);

            lastTime = currTime + timeToCall;
            return id;
        };
        window.cancelAnimationFrame = function(id) {
            return clearTimeout(id);
        };
    }
}(window));

;(function(window, undefined) {
'use strict';
var document = window.document;

;// var emptyArr = [];
var emptyFn = function() {};
var m = Math;
var getComputedStyle = document.defaultView.getComputedStyle;

function stopEvent(e) {
    e.preventDefault();
    e.stopPropagation();
}

// function getStyle(node, property) {

//     return node.style[property] || getComputedStyle(node, '').getPropertyValue(property);
// }

function getOffset(node) {
    var obj = node.getBoundingClientRect();
    return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
    };
}
//封装选择器

// function $(selector, context) {
//     context = (context && context.nodeType === 1) ? context : document;
//     return context.querySelectorAll(selector);
// }
// //getID方法

// function $$(id) {
//     return document.getElementById(id);
// }

// function toArray(arrayLike) {
//     return emptyArr.slice.call(arrayLike);
// }
var isArray = Array.isArray?Array.isArray:function(obj){
    Object.prototype.toString.call(obj).slice(8, -1) === 'Array';
};

// function prefixStyle(style) {
//     if (vendor === '') {
//         return style;
//     }

//     style = style.charAt(0).toUpperCase() + style.substr(1);
//     return vendor + style;
// }

function random(min, max) {
    var m = Math;
    return (m.random() * (max - min + 1) + min) | 0;
}
window.random = random;

;/**
 * 对象池
 * @param {[type]} opts [description]
 */
var Pool = function(opts) {
    this.min = opts.min || 4;
    this.max = opts.max || 10;
    this.freeObjArr = [];
    this.busyObjArr = [];
    if (typeof opts.objectCreater !== 'function') {
        throw '对象池需要 objectCreater 做构造函数';
        return;
    }
    this.objectCreater = opts.objectCreater;

    this.init();
};

Pool.prototype = {
    constructor: Pool,
    init: function() {
        var objectCreater = this.objectCreater;
        var min = this.min,
            max = this.max;
        for (var i = 0; i < max; i++) {
            this.freeObjArr.push(objectCreater());
        }
    },
    //释放某个对象
    freeOne: function(obj) {
        var index = this.busyObjArr.indexOf(obj);
        if (index > -1) {
            this.busyObjArr.splice(index, 1);
            if (typeof obj.init === 'function') {
                //重新初始化
                obj.init();
            }

            this.freeObjArr.push(obj);
        }
    },
    //获取一个新对象
    getOne: function() {
        if (this.freeObjArr.length > 0) {
            var obj = this.freeObjArr.pop();

            this.busyObjArr.push(obj);
            return obj;
        } else {
            var newObj = this.objectCreater();
            newObj.startBusyTime = new Date();
            this.busyObjArr.push(newObj);
            return newObj;
        }
    },
    destroy: function() {
        this.freeObjArr.length = 0;
        this.busyObjArr.length = 0;
        this.objConstructor = null;
        for (var i in this) {
            if (this.hasOwnProperty(i)) {
                delete this[i];
            }
        }
    }
}

;(function(window, document, undefined) {
    var id = Date.now();
    var Sprite = function(data) {
        //名称
        this.name = data.name;
        // 大小
        this.width = data.width;
        this.height = data.height;
        this.origin = 'leftTop'; //原点位置
        this.dx = 0;
        this.dy = 0;
        this.speedX = 0;
        this.speedY = 0;
        //唯一标识ID
        this.id = 'sprite' + (id++);
        this.timeout = data.timeout || 3000;
        this.frames = data.frames;
        this.isLive = true;
        this.curAnimate = data.curAnimate || 'normal';
        var self = this;
        this.isNextFrame = typeof data.isNextFrame === 'function' ? function() {
            data.isNextFrame.call(self);
        } : function() {
            var now = Date.now();
            var dur = now - this.lastTime;
            var stepTime = this.aniStepTime;
            return dur >= stepTime;
        }
        this.init();
    }
    Sprite.prototype = {
        constructor: Sprite,
        imgURL: 'img/voice-of-china/sprite.png',
        canDestroy: function() {
            return !this.isLive;
        },
        init: function(ani) {
            this.isLive = true;
            this.duration = 0;
            this.now = Date.now();
            //最后update 帧时间
            this.lastTime = 0;
            //当前动画第几步
            this.curAniStep = 0;
            //当前动画播放次数
            this.curAniPlayTimes = 0;

            this.setAni(ani || this.curAnimate);

            var img = new Image();
            img.src = this.imgURL;

            this.img = img;
        },
        evtClick: function() {

        },
        update: function(ctx, stage) {
            var arr = this.getUpdateData();
            var now = this.now;
            this.now = Date.now();
            this.duration += this.now - now;

            if (arr) {
                ctx.drawImage.apply(ctx, arr);
            }
            //是否到期
            if (this.isTimeout()) {
                this.isLive = false;
            }
        },
        isTimeout: function() {
            return this.duration > this.timeout;
        },
        //返回canvas绘图数组
        getUpdateData: function() {
            var arr = [this.img];
            var framesData = this.curAniFrameData;
            var now = Date.now();
            var len = framesData.length;
            if (this.curAniStep === len) {
                this.curAniStep = 0;
                this.curAniPlayTimes++;
                if (this.curAniMaxTimes !== 0 && this.curAniPlayTimes === this.curAniMaxTimes) {
                    if (this.nextAni()) {
                        framesData = this.curAniFrameData;
                    } else {
                        this.isLive = false;
                        return false;
                    }
                }
            }

            var data = framesData[this.curAniStep].slice(0);
            this.y += this.speedY;
            this.x += this.speedX;
            var tdxy = data.slice(-2);
            this.dx = tdxy[0] / -2;
            this.dy = tdxy[1] / -2;

            data.splice(4, 0, this.x + this.dx, this.y + this.dy)
            arr = arr.concat(data);

            if (this.isNextFrame.call(this)) {
                //进入下一帧动画
                this.curAniStep++;
                this.lastTime = now;
            }
            return arr;
        },
        setFPS: function(fps) {
            this.fps = fps;
            this.aniStepTime = 1000 / fps;
            return this;
        },
        setAni: function(name) {
            if (this.curAnimate === name && this.curAniStep != 0) {
                return this;
            }
            //当前动画名次
            this.curAnimate = name;
            //当前动画data
            var curData = this.curAniFrameData = this.frames[name].data;
            var data;
            for (var i = 0, len = curData.length; i < len; i++) {
                data = curData[i];

                curData[i] = data.length === 4 ? data.concat(data.slice(-2)) : data;
            }
            //设置当前动画的fps
            this.setFPS(this.frames[name].fps);
            //当前动画的帧清零
            this.curAniStep = 0;
            //当前动画的播放次数清零
            this.curAniPlayTimes = 0;
            //当前动画可以播放的最大次数
            this.curAniMaxTimes = this.frames[name].times;
            return this;
        },
        stopMove: function() {
            this.speedX = 0;
            this.speedY = 0;
            return this;
        },
        setSpeed: function(x, y) {
            this.speedX = x;
            this.speedY = y;
            return this;
        },
        setSpeedX: function(x) {
            this.speedX = x;
            return this;
        },
        setSpeedY: function(y) {
            this.speedY = y;
            return this;
        },
        setXY: function(x, y) {
            this.x = x;
            this.y = y;
            return this;
        },
        setX: function(x) {
            this.x = x;
            return this;
        },
        setY: function(y) {
            this.y = y;
            return this;
        },
        destroy: function() {
            // console.log(this.name);
            for (var i in this) {
                if (this.hasOwnProperty(i)) {
                    if (this[i] && (typeof this[i].destroy === 'function')) {
                        this[i].destroy();
                    }
                    this[i] = null;
                    delete this[i];
                }
            }
        }
    }
    window.Sprite = Sprite;
}(window, document));

;var Quoit = function() {

};

Quoit.prototype = {
    constructor: Quoit,
    duration: 60, //持续100ms
    init: function(obj) {

        obj = obj || {};
        //坐标
        this.x = obj.x || 0;
        this.y = obj.y || 0;

        //半径
        this.radius = obj.radius || 0;
        //颜色
        this.color = obj.color || '0,108,255';
        this.opacity = obj.opacity || 255;
        this.fillStyle = null;
        this.isLive = true;
        this.time = Date.now();
        return this;
    },
    pi: 2 * Math.PI,
    update: function(ctx, stage) {
        // return;
        if (!this.isLive) {
            stage.off('update', this);
            stage.quoitPool.freeOne(this);
            return;
        }
        var self = this;
        var now = Date.now();
        var tDuration = this.duration;

        var duration = now - self.time;
        if (duration > tDuration) {
            this.isLive = false;
            return;
        }
        //画圆
        if (!this.fillStyle) {
            var lingrad = ctx.createRadialGradient(self.x, self.y, 0, self.x, self.y, 70);
            lingrad.addColorStop(0, 'rgba(255,255,255,0.8)');
            lingrad.addColorStop(1, 'rgba(255,255,255,0.05)');
            this.fillStyle = lingrad;
        }

        ctx.fillStyle = self.fillStyle;
        ctx.arc(self.x, self.y, 70, 0, self.pi);
        ctx.fill();
    },
    destroy: function() {
        for (var i in this) {
            if (this.hasOwnProperty(i)) {
                delete this[i];
            }
        }
    }
};

;var Circle = function() {

};
Circle.prototype = {
    constructor: Circle,
    duration: 100, //持续100ms
    init: function(obj) {

        obj = obj || {};
        //坐标
        this.x = obj.x || 0;
        this.y = obj.y || 0;

        this.hit = obj.hit || 1;
        this.step = this.step || 0;
        //半径
        this.radius = obj.radius || 0;
        //颜色
        this.color = obj.color || '0,108,255';
        this.opacity = obj.opacity || 255;

        this.numFontSize = obj.numFontSize || 20;
        //hit英文字体大小
        this.hitFontSize = obj.hitFontSize || 20;
        //文字颜色
        this.textColor = obj.textColor || '7, 170, 255';

        this.isLive = true;
        this.time = Date.now();
        return this;
    },
    pi: 2 * Math.PI,
    update: function(ctx) {
        // return;
        if (!this.isLive) {
            return;
        }
        var self = this;
        var now = Date.now();
        var tDuration = this.duration;

        var duration = now - self.time;
        if (duration > tDuration) {
            this.isLive = false;
            return;
        }
        ctx.beginPath();
        //画圆
        ctx.fillStyle = 'rgba(' + self.color + ',' + self.opacity + ')';
        ctx.arc(self.x, self.y, self.radius, 0, self.pi);
        ctx.fill();

        //填充文字
        ctx.beginPath();
        ctx.fillStyle = 'rgb(' + self.textColor + ')';
        var text = self.hit;
        //点击次数
        ctx.font = self.numFontSize + 'px sans-serif';
        ctx.textAlign = 'right';
        var top = self.y - self.radius - 5;
        var left = self.x;
        if (self.hit > 99) {
            left += 30;
        } else if (self.hit > 19) {
            left += 10;
        }
        ctx.fillText(text, left, top);
        //hit英文
        ctx.font = self.hitFontSize + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Hit', left, top);
        ctx.fill();
        //半径等+
        self.radius++;
        self.numFontSize += 0.2;
        self.hitFontSize += 0.2;
    },
    destroy: function() {
        for (var i in this) {
            if (this.hasOwnProperty(i)) {
                delete this[i];
            }
        }
    }
};

;var Star = function(x, y) {
    this.x = x;
    this.y = y;
    this.duration = 0;
    this.init('enter');
}

Star.prototype = new Sprite({
    name: 'Star',
    width: 67,
    height: 67,
    curAnimate: 'enter',
    frames: {
        enter: {
            fps: 100,
            times: 1,
            data: [
                [0, 0, 68, 68, 8, 8],
                [0, 0, 68, 68, 16, 16],
                [0, 0, 68, 68, 26, 26],
                [0, 0, 68, 68, 38, 38],
                [0, 0, 68, 68, 52, 52],
                [0, 0, 68, 68, 68, 68],
                [0, 0, 68, 68, 86, 86],
                [0, 0, 68, 68, 106, 106],
                [0, 0, 68, 68, 106, 106],
                [0, 0, 68, 68, 106, 106],
                [0, 0, 68, 68, 68, 68]
            ]
        },
        normal: {
            fps: 30,
            times: 0,
            data: [
                [0, 0, 68, 68]
            ]
        },
        touch: {
            fps: 3,
            times: 1,
            data: [
                [77, 1, 99, 88]
            ]
        }
    }
});

Star.prototype.constructor = Star;
Star.prototype.evtClick = function(e, stage) {
    if (this.curAnimate === 'enter' || this.status === 'clicked') {
        return false;
    }
    var x = e.x,
        y = e.y;

    var x0 = this.x + this.dx;
    var y0 = this.y + this.dy;
    var x1 = this.x - this.dx;
    var y1 = this.y - this.dy;

    // console.log(x, y, x0, x1, y0, y1);
    if (x > x0 && x < x1 && y > y0 && y < y1) {
        this.status = 'clicked';
        this.clickTime = Date.now();
        this.setAni('touch');
        // 分数加倍
        stage.hits === 0 ? (stage.hits = 2) : stage.addScore(stage.hits);
        return true;
    }
    return false;
}
Star.prototype.nextAni = function() {
    if (this.curAnimate === 'enter') {
        this.setAni('normal');
        return true;
    }
    return false;
}
window.Star = Star;

;var Boss = function(x, y) {
    this.x = x;
    this.y = y;
    this.duration = 0;
    this.init('enter');
    this.hits = 0;
    this.pool = new Pool({
        min: 1,
        max: 5,
        objectCreater: function() {
            return new Quoit();
        }
    });

};
Boss.prototype = new Sprite({
    name: 'Boss',
    width: 67,
    height: 67,
    curAnimate: 'enter',
    frames: {
        enter: {
            fps: 100,
            times: 1,
            data: [
                [0, 144, 122, 122, 12, 12],
                [0, 144, 122, 122, 24, 24],
                [0, 144, 122, 122, 40, 40],
                [0, 144, 122, 122, 60, 60],
                [0, 144, 122, 122, 84, 84],
                [0, 144, 122, 122, 112, 112],
                [0, 144, 122, 122, 144, 144],
                [0, 144, 122, 122, 144, 144],
                [0, 144, 122, 122, 144, 144],
                [0, 144, 122, 122, 122, 122]
            ]
        },
        normal: {
            fps: 30,
            times: 0,
            data: [
                [0, 144, 122, 122]
            ]
        },
        step1: {
            fps: 10,
            times: 0,
            data: [
                [126, 144, 122, 122]
            ]
        },
        step2: {
            fps: 10,
            times: 0,
            data: [
                [253, 144, 122, 123]
            ]
        },

        touch: {
            fps: 3,
            times: 1,
            data: [
                [186, 0, 146, 144, 144, 143]
            ]
        }
    }
});

Boss.prototype.constructor = Boss;
Boss.prototype.evtClick = function(e, stage) {
    if (this.curAnimate === 'enter' || this.status === 'clicked') {
        return false;
    }
    var x = e.x,
        y = e.y;

    var x0 = this.x + this.dx;
    var y0 = this.y + this.dy;
    var x1 = this.x - this.dx;
    var y1 = this.y - this.dy;

    // console.log(x, y, x0, x1, y0, y1, this.dx, this.dy);

    if (x > x0 && x < x1 && y > y0 && y < y1) {
        this.hits++;
        var quoit = stage.quoitPool.getOne();
        quoit.init({
            x: this.x,
            y: this.y,
            r: Math.ceil(this.dy)
        });
        stage.on('update', quoit);

        if (this.hits === 12) {
            this.status = 'clicked';
            this.clickTime = Date.now();
            this.setAni('touch');
            stage.sound.play('gembreak');
            // 分数+40
            stage.addScore(40);
        } else if (this.hits === 7) {
            this.setAni('step2');
        } else if (this.hits === 1) {
            this.setAni('step1');
        }

        return true;
    }
    return false;
};
Boss.prototype.nextAni = function() {
    if (this.curAnimate === 'enter') {
        this.setAni('normal');
        return true;
    }
    return false;
};
window.Boss = Boss;

;var circleData = [{
    color: ['0,108,255'],
    opacity: [45, 80],
    radius: [42, 47],
    hit: 20,
    diffusion: 0.003,
    numFontSize: [32],
    hitFontSize: [18],
    textColor: '7, 170, 255',
    textDiffusion: 0.002
}, {
    color: ['255,162,0'],
    opacity: [50, 80],
    radius: [47, 57],
    hit: 50,
    diffusion: 0.005,
    numFontSize: [54],
    hitFontSize: [24],
    textColor: '110, 156, 0',
    textDiffusion: 0.002
}, {
    color: ['255,162,0', '150, 255, 0', '255, 0, 66', '0, 255, 240', '255, 222, 0', '0, 108, 255'],
    opacity: [55, 85],
    radius: [47, 72],
    hit: 9999999,
    diffusion: 0.005,
    numFontSize: [54, 64],
    hitFontSize: [24],
    textColor: '252, 74, 26',
    textDiffusion: 0.002
}];
var randomArray = function(arr) {
    var len = arr.length;
    if (len === 1) {
        return arr[0];
    } else if (len === 2 && typeof arr[0] === 'number') {
        return random(arr[0], arr[1]);
    }
    return arr[random(0, len - 1)];
};
var Stage = function(canvas, width, height, isSound) {
    canvas = this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
    this.width = width || canvas.width;
    this.height = height || canvas.height;
    this.ctx = canvas.getContext('2d');

    this.circlePool = new Pool({
        min: 1,
        max: 10,
        objectCreater: function() {
            return new Circle();
        }
    });
    this.quoitPool = new Pool({
        min: 1,
        max: 4,
        objectCreater: function() {
            return new Quoit();
        }
    });

    this.isSound = typeof isSound === 'boolean' ? isSound : true;
    if (this.isSound) {
        this.sound = new Howl({
            urls: ['./assets/voice-of-china/game.mp3', './assets/voice-of-china/game.ogg'],
            sprite: {
                gembreak: [0, 500],
                click: [700, 100],
                level1: [5400, 1800],
                level2: [1100, 4000],
                level3: [1100, 4000],
                level4: [7400, 3200]
            }
        });
    } else {
        this.sound = {
            play: function() {}
        };
    }
    this.circles = [];
    this.evts = {
        'touchstart': [],
        'update': [],
        'stop': []
    };
    this.curCircleArr = [];
    this.timeData = [];
    this.sprites = [];
};
Stage.prototype = {
    constructor: Stage,

    init: function() {
        this.reset();
        this.sprites.length = 0;

        this.curCircleArr.length = 0;
        this.circles.length = 0;
        this.hits = 0; //圆圈点击次数
        this.bindEvent('touchstart', this);
        // 复制一份
        this.cData = circleData.slice(0);
        this.curCircleArr = this.cData.shift();
        return this;
    },

    getDurationTime: function() {
        return this.duration;
    },
    //添加score
    addScore: function(score) {
        this.hits += score;
        return this;
    },
    addCircle: function(obj) {
        if (obj.x && obj.y) {

        } else {
            return this;
        }

        var self = this;
        self.addScore(1);
        var circle = self.circlePool.getOne();
        var cur = this.curCircleArr;
        if (this.hits > this.curCircleArr.hit) {
            cur = this.curCircleArr = this.cData.shift();
        }

        var radius = random(cur.radius[0], cur.radius[1]);
        var step = radius * cur.diffusion;
        var data = {
            x: obj.x,
            y: obj.y,
            //半径
            radius: radius,
            //每步半径增加尺寸
            step: step,
            //透明度
            opacity: random(cur.opacity[0], cur.opacity[1]) * 0.01,
            //颜色
            color: randomArray(cur.color),
            //第几次点击
            hit: this.hits,
            //hit字体大小
            numFontSize: randomArray(cur.numFontSize),
            //hit英文字体大小
            hitFontSize: randomArray(cur.hitFontSize),
            //文字颜色
            textColor: cur.textColor
            // textStep: cur.textDiffusion / this.duration
        };

        this.circles.push(circle.init(data));
        return this;
    },
    removeCircle: function(circle) {
        var index = this.circles.indexOf(circle); !! ~index && this.circles.splice(index, 1);
        this.circlePool.freeOne(circle);
        return this;
    },
    updateCircles: function() {
        var t, ctx = this.ctx;
        for (var i = 0, len = this.circles.length; i < len; i++) {
            t = this.circles[i];
            if (t.isLive) {
                t.update(ctx, this);
            } else {
                this.removeCircle(t);
                len--;
                i--;
            }
        }
        return this;
    },

    timeline: function(obj) {
        obj.startActive = true; //可用，活跃状态
        obj.endActive = true;
        this.timeData.push(obj);
        return this;
    },
    //添加精灵
    addSprite: function(sprite) {
        if (!~this.sprites.indexOf(sprite)) {
            this.sprites.push(sprite);
        }
        return this;
    },
    //移除精灵
    removeSprite: function(sprite) {
        var index = this.sprites.indexOf(sprite); !! ~index && this.sprites.splice(index, 1);
        return this;
    },
    update: function() {
        if (this.status !== 'play') {
            return this;
        }
        var self = this;
        this.clearRect();
        var now = this.now;
        this.now = Date.now();
        var time = this.duration += this.now - now;

        var timeData = this.timeData;
        //处理timeline
        for (var i = 0, len = timeData.length; i < len; i++) {
            var data = timeData[i];
            if (data.startActive && time >= data.startTime && time <= data.endTime) {
                //执行
                typeof data.beforeStart === 'function' && data.beforeStart(data);
                data.startActive = false;
            } else if (data.endActive && time > data.endTime) {
                //结束事件
                typeof data.afterEnd === 'function' && data.afterEnd(data);
                data.endActive = false;
            }
        }
        var ctx = this.ctx,
            sprites = this.sprites,
            sprite;
        // console.log(this.durtion);
        // 处理精灵类
        for (var i = 0, len = sprites.length; i < len; i++) {
            sprite = sprites[i];

            if (sprite.canDestroy()) {
                sprite.destroy();
                self.removeSprite(sprite);
                i--;
                len--;
            } else {
                sprite.update(ctx, self);
            }
        }

        this.updateCircles();

        this.fire('update', [ctx, this]);
        return this;
    },
    clearRect: function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        return this;
    },
    on: function(type, callback, scope, args) {
        var cType = typeof callback;
        var cb = function() {};
        scope = scope || window;
        args = isArray(args) ? args : [args];
        switch (cType) {
            case 'function':
                cb = callback;
                break;
            case 'object':
                if (typeof callback.update === 'function') {
                    scope = callback;
                    cb = callback.update;
                }
                break;
        }
        var evts = this.evts[type] || [];
        var obj = {
            fn: cb,
            scope: scope,
            args: args,
            _cb: callback
        };
        evts.push(obj);
        return this;
    },
    //事件绑定统一入口
    handleEvent: function(e) {
        var type = e.type;
        switch (type) {
            case 'touchstart':
                stopEvent(e);
                this.touchstart(e);
                break;
        }
        var evts = this.evts[type];
        if (evts && evts.length > 0) {
            this.fire(type, e);
        }
    },
    touchstart: function(e) {
        if (this.status !== 'play') {
            return this;
        }
        this.sound.play('click');
        var clicked = false,
            args = {},
            self = this;
        var offset = getOffset(this.canvas);
        var touches = e.changedTouches[0];
        args.x = touches.pageX - offset.left;
        args.y = touches.pageY - offset.top;
        var sprites = this.sprites,
            sprite;
        // 处理精灵类
        for (var i = 0, len = sprites.length; i < len; i++) {
            sprite = sprites[i];

            if (!sprite.canDestroy()) {
                clicked = sprite.evtClick(args, self);
                if (clicked) {
                    break;
                }
            }
        }
        if (!clicked) {
            //精灵没有被点击，那么开始添加圆形
            self.addCircle(args);
        }

        return clicked;
    },
    //解除绑定
    off: function(type, callback) {
        var evts = this.evts[type],
            len;
        if (!evts || !(len = evts.length)) {
            return this;
        }
        var cType = typeof callback;
        var attr = 'fn';
        switch (cType) {
            case 'function':
                break;
            case 'object':
                attr = '_cb';
                break;
        }
        for (var i = 0; i < len; i++) {
            if (evts[i][attr] === callback) {
                evts.splice(i--, 1);
                len--;
            }
        }
        return this;
    },
    //触发事件
    fire: function(type, args, scope) {
        if (this.status !== 'play' && type !== this.status) {
            return this;
        }
        var evts = this.evts[type];
        if (evts && evts.length > 0) {
            if (type === 'touchstart') {
                var touches = args.touches[0];
                if (!touches) {
                    return;
                }
                var offset = getOffset(this.canvas);
                args.x = touches.pageX - offset.left;
                args.y = touches.pageY - offset.top;
            }
            args = isArray(args) ? args : [args];
            for (var i = 0, len = evts.length; i < len; i++) {
                var obj = evts[i];
                if (!obj) {
                    continue;
                }
                var fn = obj.fn,
                    arg = obj.args;
                scope = obj.scope || window;
                arg = args.concat(arg);
                fn.apply(scope, arg);
            }

        }
    },
    play: function(msg) {
        this.status = 'play';
        var now = this.now = Date.now();
        //精灵初始化
        var sprites = this.sprites,
            sprite;

        for (var i = 0, len = sprites.length; i < len; i++) {
            sprite = sprites[i];
            sprite.now = now;
        }

        this.fire('play', msg);
        this.update();
        return this;
    },
    pause: function(msg) {
        this.status = 'pause';
        this.fire('pause', msg);
        var now = Date.now();
        this.duration += now - this.now;
        return this;
    },
    stop: function(msg) {
        this.status = 'stop';
        this.timeData.length = 0;
        this.fire('stop', msg);
        this.clearRect();
        return this;
    },
    //reset
    reset: function() {
        this.clearRect();
        this.status = 'pending';
        this.duration = 0;

        var timeData = this.timeData;
        for (var i = 0, len = timeData.length; i < len; i++) {
            timeData[i].startActive = true;
            timeData[i].endActive = true;
        }
        this.unbindEvent('touchstart', this);
        return this;
    },
    //绑定自定义事件
    bindEvent: function(type, fn) {
        var temp = typeof fn;
        if (temp === 'function' || temp === 'object') {
            this._bind(this.canvas, type, fn, true);
        }
        return this;
    },
    unbindEvent: function(type, fn) {
        var temp = typeof fn;
        if (temp === 'function' || temp === 'object') {
            this._unbind(this.canvas, type, fn, true);
        }
        return this;
    },
    _bind: function($node, type, fn, capture) {
        $node.addEventListener(type, fn, typeof capture === 'boolean' ? capture : false);
        return this;
    },
    _unbind: function($node, type, fn, capture) {
        $node.removeEventListener(type, fn, typeof capture === 'boolean' ? capture : false);
        return this;
    },
    destroy: function() {
        for (var i in this) {
            if (typeof this[i].destroy === 'function') {
                this[i].destroy(this);
            } else if (isArray(this[i])) {
                this[i].length = 0;
            }

            if (this.hasOwnProperty(i)) {
                delete this[i];
            }
        }
    }
};
window.Stage = Stage;

;}(this));
