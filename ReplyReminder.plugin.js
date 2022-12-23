/**
 * @name ReplyReminder
 * @description Allows you to see the members of each role on a server.
 * @version 0.0.1
 * @author Mark123
 * @authorId 249746236008169473
 * @website https://github.com/Mark123M/unghost
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {
    info: {
        name: "ReplyReminder",
        authors: [
            {
                name: "Mark123",
                github_username: "Mark123",
            }
        ],
        version: "0.0.1",
        description: "Notifies you if you have ghosted someone.",
        github: "https://github.com/Mark123M/unghost",
    },
    defaultConfig: [
      {
          type: "switch",
          id: "showReminders",
          name: "Show Reminders",
          note: "Turning this on would show reminders",
          value: true
      },
      {
          type: "textbox",
          id: "reminderInterval",
          name: "Reminder Interval",
          note: "Enter a positive integer to set the time interval (in minutes) between each reminder. Any other input will reset the interval to 15 min",
          value: 10000
      } 
    ],
    changelog: [
      {
          title: "Deployment",
          type: "fixed",
          items: [
          "It works?",      
          ]
        }
    ],
    main: "index.js"
  };
  
  module.exports = !global.ZeresPluginLibrary ?
  class {
    constructor() {
        this._config = config;
        
    }
  
    load() {
        BdApi.showConfirmationModal('Library plugin is needed',
            `The library plugin needed for AQWERT'sPluginBuilder is missing. Please click Download Now to install it.`, {
            confirmText: 'Download',
            cancelText: 'Cancel',
            onConfirm: () => {
                request.get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', (error, response, body) => {
                    if (error)
                        return electron.shell.openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
  
                    fs.writeFileSync(path.join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body);
                });
            }
        });
    }
  
    start() { }
  
    stop() { }
  }
   : (([Plugin, Api]) => {
     const plugin = (Plugin, Api) => {
    const {DOM, ContextMenu, Patcher, Webpack, UI, Utils} = window.BdApi;
    const {DiscordModules, DiscordSelectors, Utilities, Popouts, Modals} = Api;
  
    const from = arr => arr && arr.length > 0 && Object.assign(...arr.map(([k, v]) => ({[k]: v})));
    const filter = (obj, predicate) => from(Object.entries(obj).filter((o) => {return predicate(o[1]);}));
  
    const UserStore = DiscordModules.UserStore;
    const ImageResolver = DiscordModules.ImageResolver;
  
    const RelationshipStore = DiscordModules.RelationshipStore;
    const MessageStore = DiscordModules.MessageStore;
    const MessageActions = DiscordModules.MessageActions;
    const ChannelStore = DiscordModules.ChannelStore;
    const SelectedChannelStore = DiscordModules.SelectedChannelStore;
  
    const allDMChannels = RelationshipStore.getFriendIDs().map(id => ChannelStore.getDMFromUserId(id))
  
    let allGhosted = [];
    let reminderModal = null
  
  
    return class RoleMembers extends Plugin {
  
        onStart() {
  
            allGhosted = BdApi.loadData('Unghost', 'ghosted') === undefined ? [] : BdApi.loadData('Unghost', 'ghosted');  //load all previously saved reminders
            reminderModal =  setInterval(()=>{
              console.log(allGhosted)
              
              const listHTML = BdApi.DOM.parseHTML(
              `<div class = "reminderList" style = "color: #b9bbbe; font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif;">
                  ${allGhosted.map(g =>
                      `<div class = "reminderListItem" style = "display: flex; align-items: center; margin-top: 10px; margin-left: 5px;"> 
                          <img src = ${g[3]} style = "border-radius: 50%; height: 60px; width: 60px "> 
                          <span style= "margin-left: 12px;" > 
                              <div class = "listItemInfo">
                                  <div class = "listItemUser" style = "font-weight: 700; color: #f8f8f9;"> 
                                    ${g[1] + " #" + g[2]} 
                                  </div>
                                  <div class = "listItemMsg" style = "margin-top: 5px;"> ${g[4]}</div>
                              </div>
                          </span>
                      </div>`
                  ).join("")}
              </div>`)
              console.log(listHTML)
              console.log(parseInt(this.settings.reminderInterval))
  
             // const testHTML = BdApi.DOM.parseHTML( `<div class = "reminderList" style = "color: ;"> hello </div>`)
              BdApi.UI.alert("Remember to respond!", BdApi.React.createElement(BdApi.ReactUtils.wrapElement(listHTML)))
  
            }, Number.isInteger(parseInt(this.settings.reminderInterval)) && parseInt(this.settings.reminderInterval) > 0
            ? parseInt(this.settings.reminderInterval) : 3000)
        }
  
        onStop() {
            BdApi.saveData('Unghost', 'ghosted', allGhosted)
            clearInterval(reminderModal)
        }
        
        onSwitch(){
          const lastChannelId = SelectedChannelStore.getLastSelectedChannelId()
          console.log(ChannelStore.getChannel(lastChannelId), 'lastchannel')
          
          //Check if the last visited channel is a dm
          if(ChannelStore.getChannel(lastChannelId).name === ""){
              const messages = MessageStore.getMessages(lastChannelId)._array
              const lastMsg = messages[messages.length - 1]
              const currentUser = UserStore.getCurrentUser()
            
              console.log(lastMsg.author, 'sdsuofnsduifuisdhfuihsduifhuisdhfuisd');
  
              if (lastMsg.author.id != currentUser.id){
                  //filter the array and replace the previous message of the same author with their new message
                  allGhosted = allGhosted.filter(g => g[0] !== lastMsg.author.id)
                  allGhosted.push([lastMsg.author.id, lastMsg.author.username, lastMsg.author.discriminator, ImageResolver.getUserAvatarURL(lastMsg.author), lastMsg.content] )
                  BdApi.saveData('Unghost', 'ghosted', allGhosted) 
                  
              } else { 
                  //filter the array to remove the previous message of the author.
                  allGhosted = allGhosted.filter(g => g[0] !== ChannelStore.getChannel(lastChannelId).recipients[0]) 
                  BdApi.saveData('Unghost', 'ghosted', allGhosted)  
                 // console.log('all ghosted', allGhosted)
              }
          }
        }
        getSettingsPanel(){
          return this.buildSettingsPanel().getElement();
        }
  
    };
  };
     return plugin(Plugin, Api);
  })(global.ZeresPluginLibrary.buildPlugin(config));
  /*@end@*/