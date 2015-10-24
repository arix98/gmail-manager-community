// Gmail Manager-community
// Alexis THOMAS (https://github.com/ath0mas)
// Forked from Gmail Manager NG by Erik Nedwidek (https://github.com/nedwidek)
// Based on Gmail Manager by Todd Long <longfocus@gmail.com>

var gmanager_ToolbarMenu = new function()
{
  var gmToolbarMenu = Object.create(new gmanager_BundlePrefix("gmanager-toolbar-menu-"));

  gmToolbarMenu.init = function()
  {
    // Load the accounts manager
    gmToolbarMenu._manager = Components.classes["@gmail-manager-community.github.com/gmanager/manager;1"].getService(Components.interfaces.gmIManager);
  }

  gmToolbarMenu._createMenuitem = function(aLabel)
  {
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("label", gmToolbarMenu.getString(aLabel));
    menuitem.setAttribute("accesskey", gmToolbarMenu.getString(aLabel + "-ak"));
    return menuitem;
  }

  gmToolbarMenu.buildMenu = function(aPopup)
  {
    var accounts = gmToolbarMenu._manager.getAccounts({});
    var menuitem = null;
    
    // Clear the menu
    gmanager_Utils.clearKids(aPopup);
    
    // Compose Mail
    var composeMenu = document.createElement("menu");
    var composeMenupopup = document.createElement("menupopup");
    composeMenu.setAttribute("label", gmToolbarMenu.getString("compose-mail"));
    composeMenu.setAttribute("accesskey", gmToolbarMenu.getString("compose-mail-ak"));
    composeMenupopup.addEventListener("popupshowing", function() { gmanager_ToolbarMenu.buildComposeMenu(this); }, false);
    composeMenu.appendChild(composeMenupopup);
    aPopup.appendChild(composeMenu);
    
    // Separator
    aPopup.appendChild(document.createElement("menuseparator"));
    
    // Check if any accounts exist
    if (accounts.length > 0)
    {
      var toolbarItem = aPopup.parentNode;
      var numLoggedIn = 0;
      
      for (var i = 0, n = accounts.length; i < n; i++)
        numLoggedIn += (accounts[i].loggedIn ? 1 : 0);
      
      // Login All Accounts
      menuitem = gmToolbarMenu._createMenuitem("login-all-accounts");
      menuitem.addEventListener("command", function() { gmanager_Accounts.loginAllAccounts(); }, false);
      menuitem.setAttribute("disabled", (numLoggedIn === accounts.length));
      aPopup.appendChild(menuitem);
      
      // Logout All Accounts
      menuitem = gmToolbarMenu._createMenuitem("logout-all-accounts");
      menuitem.addEventListener("command", function() { gmanager_Accounts.logoutAllAccounts(); }, false);
      menuitem.setAttribute("disabled", (numLoggedIn === 0));
      aPopup.appendChild(menuitem);
      
      // Check All Accounts
      menuitem = gmToolbarMenu._createMenuitem("check-all-accounts");
      menuitem.addEventListener("command", function() { gmanager_Accounts.checkAllAccounts(); }, false);
      menuitem.setAttribute("disabled", (numLoggedIn === 0));
      aPopup.appendChild(menuitem);
      
      // Separator
      aPopup.appendChild(document.createElement("menuseparator"));
      
      if (gmanager_Toolbars.isToolbarItem(toolbarItem))
      {
        var toolbarAccount = toolbarItem.account;
        var displayAccount = toolbarItem.displayAccount;
        
        if (displayAccount)
        {
          if (displayAccount.loggedIn)
          {
            // Logout Selected Account
            menuitem = gmToolbarMenu._createMenuitem("logout-selected-account");
            menuitem.addEventListener("command", function() { gmanager_Accounts.logoutAccount('" + displayAccount.email + "'); }, false);
            aPopup.appendChild(menuitem);
          }
          else
          {
            // Login Selected Account
            menuitem = gmToolbarMenu._createMenuitem("login-selected-account");
            menuitem.addEventListener("command", function() { gmanager_Accounts.loginAccount('" + displayAccount.email + "'); }, false);
            aPopup.appendChild(menuitem);
          }
          
          // Check Selected Account
          menuitem = gmToolbarMenu._createMenuitem("check-selected-account");
          menuitem.addEventListener("command", function() { gmanager_Accounts.checkAccount('" + displayAccount.email + "'); }, false);
          menuitem.setAttribute("disabled", !displayAccount.loggedIn);
          aPopup.appendChild(menuitem);
          
          // Display Mail Snippets...
          menuitem = gmToolbarMenu._createMenuitem("display-snippets");
          menuitem.addEventListener("command", function() { gmanager_Alerts.display('" + displayAccount.email + "'); }, false);
          menuitem.setAttribute("disabled", (!displayAccount.loggedIn && displayAccount.getSnippets({}).length === 0));
          aPopup.appendChild(menuitem);
          
          // Separator
          aPopup.appendChild(document.createElement("menuseparator"));
        }
        
        accounts.forEach(function(account, index, array) {
          menuitem = document.createElement("menuitem");
          menuitem.setAttribute("class", "gmanager-toolbar-menuitem");
          menuitem.setAttribute("checked", (displayAccount && displayAccount.email === account.email));
          menuitem.setAttribute("default", (toolbarAccount && toolbarAccount.email === account.email));
          menuitem.setAttribute("alias", gmanager_Utils.toUnicode(account.alias));
          menuitem.setAttribute("unread", account.unread);
          menuitem.setAttribute("icontype", account.type);
          menuitem.setAttribute("status", gmanager_Utils.toStyleStatus(account.status));
          menuitem.setAttribute("newMail", account.unread > 0);
          menuitem.addEventListener("command", function() { gmanager_ToolbarMenu.switchAccount('" + account.email + "'); }, false);
          
          aPopup.appendChild(menuitem);
        });
        
        // Separator
        aPopup.appendChild(document.createElement("menuseparator"));
      }
    }
    else
    {
      // Login Account...
      menuitem = gmToolbarMenu._createMenuitem("login-account");
      menuitem.addEventListener("command", function() { gmanager_Utils.showLogin(); }, false);
      aPopup.appendChild(menuitem);
      
      // Separator
      aPopup.appendChild(document.createElement("menuseparator"));
    }
    
    // Visit Homepage
    menuitem = gmToolbarMenu._createMenuitem("visit-homepage");
    menuitem.addEventListener("command", function() { gmanager_Utils.loadSimpleURI(gmanager_Utils.WEBSITE); }, false);
    aPopup.appendChild(menuitem);
    
    // Options...
    menuitem = gmToolbarMenu._createMenuitem("options");
    menuitem.setAttribute("default", "true");
    menuitem.addEventListener("command", function() { window.openDialog('chrome://gmanager/content/options/options.xul', 'options', 'centerscreen,chrome,modal,resizable'); }, false);
    aPopup.appendChild(menuitem);
    
    // Show the menu
    return true;
  }

  gmToolbarMenu.buildComposeMenu = function(aPopup)
  {
    var accounts = gmToolbarMenu._manager.getAccounts({});
    var menuitem = null;
    
    // Clear the menu
    gmanager_Utils.clearKids(aPopup);
    
    // Default Mail Client
    menuitem = gmToolbarMenu._createMenuitem("default-client");
    menuitem.addEventListener("command", function() { gmanager_ToolbarMenu.composeAccount(null); }, false);
    aPopup.appendChild(menuitem);
    
    // Check if any accounts exist
    if (accounts.length > 0)
    {
      // Separator
      aPopup.appendChild(document.createElement("menuseparator"));
      
      accounts.forEach(function(account, index, array) {
        menuitem = document.createElement("menuitem");
        menuitem.setAttribute("label", account.email);
        menuitem.addEventListener("command", function() { gmanager_ToolbarMenu.composeAccount('" + account.email + "'); }, false);
        aPopup.appendChild(menuitem);
      });
    }
    
    // Show the menu
    return true;
  }

  gmToolbarMenu.composeAccount = function(aEmail)
  {
    var location = gmToolbarMenu._manager.global.getCharPref("compose-tab-location");
    var href = gmanager_Utils.getHref(document.popupNode);
    
    gmanager_Accounts.openCompose(aEmail, location, href);
  }

  gmToolbarMenu.switchAccount = function(aEmail)
  {
    if (gmToolbarMenu._manager.isAccount(aEmail))
    {
      var account = gmToolbarMenu._manager.getAccount(aEmail);
      var toolbarItem = document.popupNode;
      
      if (gmanager_Toolbars.isToolbarItem(toolbarItem))
        toolbarItem.displayAccount = account;
      
      if (account.loggedIn && gmToolbarMenu._manager.global.getBoolPref("toolbar-auto-check"))
        account.check();
      else if (!account.loggedIn && gmToolbarMenu._manager.global.getBoolPref("toolbar-auto-login"))
        account.login(null);
    }
  }

  gmToolbarMenu.init();

  return gmToolbarMenu;
}