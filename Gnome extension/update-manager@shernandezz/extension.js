const Clutter = imports.gi.Clutter
const Lang = imports.lang
const St = imports.gi.St
const GObject = imports.gi.GObject
const GLib = imports.gi.GLib
const Gio = imports.gi.Gio
const Gtk = imports.gi.Gtk
const Main = imports.ui.main
const PanelMenu = imports.ui.panelMenu
const PopupMenu = imports.ui.popupMenu
const Me = imports.misc.extensionUtils.getCurrentExtension()
const Gettext = imports.gettext.domain('arch-update')
const _ = Gettext.gettext
const Mainloop = imports.mainloop

const SPACE = " "
const NEWLINE = "\n"
const EMPTY_TEXT = ""

const UPDATE_MANAGER_NAME = "UpdateManager"

const ICONS_DIR = "/icons/"

const SVG_FORMAT = ".svg"

const DISABLED_ICON = "icon-disabled"
const ENABLED_ICON = "icon-enabled"
const DOWNLOAD_ICON = "icon-download"

const SYSTEM_ICON_STYLE = "system-status-icon"
const PANEL_MENU_BOX_STYLE = "panel-status-menu-box"
const MENU_EXPANDER_STYLE = "arch-updates-list"
const UPDATE_BUTTON_STYLE = "system-menu-action arch-updates-menubutton"

const PANEL_BUTTON_LABEL_STARTING_TEXT = "..."

const REFRESH_MENU_ITEM_DEFAULT_TEXT = "Refresh"
const UPDATE_ALL_MENU_ITEM_DEFAULT_TEXT = "Update All"
const REFRESHING_TEXT = "Refreshing..."
const UPDATING_TEXT = "Updating..."

const WAITING_FOR_CHECK_TEXT = "Waiting first check"
const EVERYTHING_UP_TO_DATE_TEXT = "Everything up to date"

const SINGLE_AUR_UPDATE_FORMAT = "%d AUR update"
const SINGLE_PACMAN_UPDATE_FORMAT = "%d pacman update"
const MULTIPLE_AUR_UPDATE_FORMAT = "%d AUR updates"
const MULTIPLE_PACMAN_UPDATE_FORMAT = "%d pacman updates"

const CLICKED_BIND = "clicked"
const ACTIVATE_BIND = "activate"

const PARSE_ERROR = "Parse error"

const GET_AUR_UPDATES_COMMAND = "/home/santiago/.scripts/arch-update-manager.sh -Lu -A"
const GET_PACMAN_UPDATES_COMMAND = "/home/santiago/.scripts/arch-update-manager.sh -Lu -P"
const INSTALL_AUR_UPDATES_COMMAND = "/usr/bin/alacritty --title 'Updating AUR Packages' --command /home/santiago/.scripts/taur.sh -Syu"
const INSTALL_PACMAN_UPDATES_COMMAND = "/usr/bin/alacritty --title 'Updating Pacman Packages' --command sudo pacman -Syu"

let timeout, updateManager

const UpdateManager = new Lang.Class({
	Name: UPDATE_MANAGER_NAME,
	Extends: PanelMenu.Button,

	_updateProcess_sourceId: null,
	_updateProcess_pid: null,

	_getCustomIcon: function(icon_name) {
		return Gio.icon_new_for_string( Me.dir.get_path() + ICONS_DIR + icon_name + SVG_FORMAT )
	},

	_init: function() {
		this.parent(0.0, UPDATE_MANAGER_NAME)

		this.updateIcon = new St.Icon({
            gicon: this._getCustomIcon(DISABLED_ICON),
            style_class: SYSTEM_ICON_STYLE,
        })

		this.panelButtonLabel = new St.Label({ 
			text: PANEL_BUTTON_LABEL_STARTING_TEXT,
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER 
		})

		let box = new St.BoxLayout({
			vertical: false,
			style_class: PANEL_MENU_BOX_STYLE
		})

		box.add_child(this.updateIcon)
		box.add_child(this.panelButtonLabel)
		this.add_child(box)

		// Trick on menuitem to keep menu opened
		this.refreshMenuItem = new PopupMenu.PopupMenuItem(_(REFRESH_MENU_ITEM_DEFAULT_TEXT))
		this.refreshMenuContainer = new PopupMenu.PopupMenuSection()
		this.refreshMenuContainer.actor.add_actor(this.refreshMenuItem.actor)
		
		this.updateAllMenuItem = new PopupMenu.PopupMenuItem(_(UPDATE_ALL_MENU_ITEM_DEFAULT_TEXT))

		// Menu Expanders
		this.pacmanMenuExpander = new PopupMenu.PopupSubMenuMenuItem(EMPTY_TEXT)
		this.pacmanMenuExpander.menu.box.style_class = MENU_EXPANDER_STYLE
		this.aurMenuExpander = new PopupMenu.PopupSubMenuMenuItem(EMPTY_TEXT)
		this.aurMenuExpander.menu.box.style_class = MENU_EXPANDER_STYLE

		// Update buttons (next to menu expanders)
		this._aurUpdateButton = new St.Button({
			child: new St.Icon({ gicon: this._getCustomIcon(DOWNLOAD_ICON) }),
			style_class: UPDATE_BUTTON_STYLE,
			x_expand: true
		})

		this._pacmanUpdateButton = new St.Button({
			child: new St.Icon({ gicon: this._getCustomIcon(DOWNLOAD_ICON) }),
			style_class: UPDATE_BUTTON_STYLE,
			x_expand: true
		})

		this._aurUpdateButton.set_x_align(Clutter.ActorAlign.END )
		this.aurMenuExpander.actor.add_actor( this._aurUpdateButton )
		this._aurUpdateButton.connect(CLICKED_BIND, Lang.bind(this, this._installAurUpdates))

		this._pacmanUpdateButton.set_x_align(Clutter.ActorAlign.END)
		this.pacmanMenuExpander.actor.add_actor( this._pacmanUpdateButton )
		this._pacmanUpdateButton.connect(CLICKED_BIND, Lang.bind(this, this._installPacmanUpdates))

		// Assemble all menu items into the popup menu
		this.menu.addMenuItem(this.pacmanMenuExpander)
		this.menu.addMenuItem(this.aurMenuExpander)
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())
		this.menu.addMenuItem(this.refreshMenuContainer)
		this.menu.addMenuItem(this.updateAllMenuItem)

		// Some initial status display
		this._pacmanUpdateMenuExpander(false, _(WAITING_FOR_CHECK_TEXT))
		this._aurUpdateMenuExpander(false, _(EMPTY_TEXT))

		this.updateAllMenuItem.connect(ACTIVATE_BIND, Lang.bind(this, this._installAllUpdates))
		this.refreshMenuItem.connect(ACTIVATE_BIND, Lang.bind(this, this._refreshUpdates))

		this._list_of_pacman_updates = []
		this._list_of_aur_updates = []
		this._number_of_pacman_updates = 0
		this._number_of_aur_updates = 0
    },

	_updatePanelLabel: function () {
		if (this._aur_updates_ready && this._pacman_updates_ready) {
			var total_number_of_updates = this._number_of_aur_updates + this._number_of_pacman_updates

			if (total_number_of_updates == 0) {
				this.panelButtonLabel.visible = false
				this._pacmanUpdateMenuExpander( false, _(EVERYTHING_UP_TO_DATE_TEXT) )
				this.updateIcon.set_gicon( this._getCustomIcon(DISABLED_ICON) )
				this.updateAllMenuItem.actor.reactive = false

			} else {
				this.updateIcon.set_gicon( this._getCustomIcon(ENABLED_ICON) )
				this.panelButtonLabel.set_text( total_number_of_updates.toString() )

				this._aurUpdateMenuExpander( true, Gettext.ngettext( SINGLE_AUR_UPDATE_FORMAT, MULTIPLE_AUR_UPDATE_FORMAT, this._number_of_aur_updates ).format(this._number_of_aur_updates) )
				this._pacmanUpdateMenuExpander( true, Gettext.ngettext( SINGLE_PACMAN_UPDATE_FORMAT, MULTIPLE_PACMAN_UPDATE_FORMAT, this._number_of_pacman_updates ).format(this._number_of_pacman_updates) )
			}

			// Reset the status
			this._aur_updates_ready = false
			this._pacman_updates_ready = false
			this.updateAllMenuItem.label.set_text(UPDATE_ALL_MENU_ITEM_DEFAULT_TEXT)
			this.refreshMenuItem.label.set_text(REFRESH_MENU_ITEM_DEFAULT_TEXT)
		} 
	},

	_readAurUpdates: function() {
		// Read the buffered output
		let aurUpdatesList = []
		let out, size
		do {
			[out, size] = this._aurUpdateProcess_stream.read_line_utf8(null)
			if (out) aurUpdatesList.push(out)
		} while (out)
		
		this._aur_updates_list = aurUpdatesList.toString()
		this._aur_updates_list = this._aur_updates_list.replace(NEWLINE, EMPTY_TEXT)
        this._aur_updates_list = this._aur_updates_list.split(SPACE)
		this._aur_updates_list = this._aur_updates_list.filter(e =>  e)

		this._number_of_aur_updates = this._aur_updates_list.length

		this._aur_updates_ready = true
		this._updatePanelLabel()
	},

	_readPacmanUpdates: function() {
		// Read the buffered output
		let pacmanUpdatesList = []
		let out, size
		do {
			[out, size] = this._pacmanUpdateProcess_stream.read_line_utf8(null)
			if (out) pacmanUpdatesList.push(out)
		} while (out)

		this._pacman_updates_list = pacmanUpdatesList.toString()
		this._pacman_updates_list = this._pacman_updates_list.replace(NEWLINE, EMPTY_TEXT)
        this._pacman_updates_list = this._pacman_updates_list.split(SPACE)
		this._pacman_updates_list = this._pacman_updates_list.filter(e =>  e)

		this._number_of_pacman_updates = this._pacman_updates_list.length

		this._pacman_updates_ready = true
		this._updatePanelLabel()
	},

	_getAvailableAurUpdates: function() {
		try {
			// Parse check command line
			let [parseok, argvp] = GLib.shell_parse_argv( GET_AUR_UPDATES_COMMAND )
			if (!parseok) { throw PARSE_ERROR }
			let [res, pid, in_fd, out_fd, err_fd]  = GLib.spawn_async_with_pipes(null, argvp, null, GLib.SpawnFlags.DO_NOT_REAP_CHILD, null)
			// Let's buffer the command's output - that's a input for us !
			this._aurUpdateProcess_stream = new Gio.DataInputStream({
				base_stream: new Gio.UnixInputStream({fd: out_fd})
			})
			// We will process the output at once when it's done
			this._updateProcess_sourceId = GLib.child_watch_add(0, pid, Lang.bind(this, function() {this._readAurUpdates()}))
			this._updateProcess_pid = pid

		} catch (err) {
			this._showChecking(false)
			this.lastUnknowErrorString = err.message.toString()
			this._updateStatus(-2)
		}
	},

	_getAvailablePacmanUpdates: function() {
		try {
			// Parse check command line
			let [parseok, argvp] = GLib.shell_parse_argv( GET_PACMAN_UPDATES_COMMAND )
			if (!parseok) { throw PARSE_ERROR }
			let [res, pid, in_fd, out_fd, err_fd]  = GLib.spawn_async_with_pipes(null, argvp, null, GLib.SpawnFlags.DO_NOT_REAP_CHILD, null)
			// Let's buffer the command's output - that's a input for us !
			this._pacmanUpdateProcess_stream = new Gio.DataInputStream({
				base_stream: new Gio.UnixInputStream({fd: out_fd})
			})
			// We will process the output at once when it's done
			this._updateProcess_sourceId = GLib.child_watch_add(0, pid, Lang.bind(this, function() {this._readPacmanUpdates()}))
			this._updateProcess_pid = pid

		} catch (err) {
			this._showChecking(false)
			this.lastUnknowErrorString = err.message.toString()
			this._updateStatus(-2)
		}
	},

	_checkForAvailableUpdates: function() {
		this._number_of_aur_updates = EMPTY_TEXT
		this._number_of_pacman_updates = EMPTY_TEXT

		this._getAvailableAurUpdates()
		this._getAvailablePacmanUpdates()
	},

	_pacmanUpdateMenuExpander: function(enabled, label) {
		this.pacmanMenuExpander.menu.box.destroy_all_children()

		if (label == EMPTY_TEXT) {
			this.pacmanMenuExpander.actor.visible = false

		} else {
			this.pacmanMenuExpander.actor.reactive = enabled
			this._pacmanUpdateButton.visible = enabled
			this.pacmanMenuExpander._triangle.visible = false
			this.pacmanMenuExpander.label.set_text(label)
			this.pacmanMenuExpander.actor.visible = true
			
			if (enabled && this._number_of_pacman_updates > 0) {
				this._pacman_updates_list.forEach( item => {
					this.pacmanMenuExpander.menu.box.add( new St.Label({ text: item }) )
				} )
			} 
		}
	},

	_aurUpdateMenuExpander: function(enabled, label) {
		this.aurMenuExpander.menu.box.destroy_all_children()

		if (label == EMPTY_TEXT || this._number_of_aur_updates == 0) {
			this.aurMenuExpander.actor.visible = false

		} else {
			this.aurMenuExpander.actor.reactive = enabled
			this._aurUpdateButton.visible = enabled
			this.aurMenuExpander._triangle.visible = false
			this.aurMenuExpander.label.set_text(label)
			this.aurMenuExpander.actor.visible = true

			if (enabled && this._number_of_aur_updates > 0) {
				this._aur_updates_list.forEach( item => {
					this.aurMenuExpander.menu.box.add( new St.Label({ text: item }) )
				} )	
			}
		}
	},

	_installAurUpdates: function() {
		this.aurMenuExpander.label.set_text(UPDATING_TEXT)
		imports.misc.util.trySpawnCommandLine( INSTALL_AUR_UPDATES_COMMAND )
	},

	_installPacmanUpdates: function() {
		this.pacmanMenuExpander.label.set_text(UPDATING_TEXT)
		imports.misc.util.trySpawnCommandLine( INSTALL_PACMAN_UPDATES_COMMAND )
	},

	_installAllUpdates: function() {
		this.updateAllMenuItem.label.set_text(UPDATING_TEXT)

		if (this._number_of_aur_updates > 0) {
			this._installAurUpdates()
		} 
		
		if (this._number_of_pacman_updates > 0) {
			this._installPacmanUpdates()
		}
	},

	_refreshUpdates: function() {
		this.refreshMenuItem.label.set_text(REFRESHING_TEXT)
		this._checkForAvailableUpdates()
	},
})

function init() { }

function enable() {
	updateManager = new UpdateManager()
	Main.panel.addToStatusArea(UPDATE_MANAGER_NAME, updateManager)

	updateManager._checkForAvailableUpdates()
	timeout = Mainloop.timeout_add_seconds(600.0, () => {
		updateManager._checkForAvailableUpdates()

		return true
	})
}

function disable() {
	Mainloop.source_remove(timeout)
	updateManager.destroy()
}