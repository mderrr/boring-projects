/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const Clutter = imports.gi.Clutter
const Lang = imports.lang
const St = imports.gi.St
const GLib = imports.gi.GLib
const Gio = imports.gi.Gio
const Main = imports.ui.main
const PanelMenu = imports.ui.panelMenu
const PopupMenu = imports.ui.popupMenu
const Me = imports.misc.extensionUtils.getCurrentExtension()
const Mainloop = imports.mainloop
const Util = imports.misc.util

const EMPTY = ""
const SPACE = " "
const COMMA = ","
const SEMICOLON = ";"
const PERCENTAGE = "%"
const NEWLINE = "\n"

const UNIT_KILOBYTES_PER_SECOND = "kB/s"
const UNIT_MEGABYTE = "MB"
const UNIT_GIGABYTE = "GB"
const UNIT_MEGAHERTZ = "MHz"

const UNA_NAME = "UnameSection"
const CPU_NAME = "CpuSection"
const MEM_NAME = "MemSection"
const NET_NAME = "NetSection"
const DTE_NAME = "DateSection"

const SYSTEM_ICON_STYLE = "system-status-icon"
const PANEL_MENU_BOX_STYLE = "panel-status-menu-box"
const DTE_STYLE = "date"
const NET_STYLE = "network"
const MEM_STYLE = "mem"
const CPU_STYLE = "cpu"
const UNA_STYLE = "uname"

const ICONS_DIR = "/icons/"
const SVG_FORMAT = ".svg"

const UNA_ICON = "linux-tux"
const CPU_ICON = "cpu"
const MEM_ICON = "buffer"
const NET_RX_ICON = "arrow-down"
const NET_TX_ICON = "arrow-up"
const DTE_ICON = "calendar"

const DAY_LABEL_ITEM_FORMAT = "Day:\t\t\t"
const MONTH_LABEL_ITEM_FORMAT = "Month:\t\t"
const YEAR_LABEL_ITEM_FORMAT = "Year:\t\t\t"
const FULL_TIME_LABEL_ITEM_FORMAT = "Time:\t\t\t"
const TIME_ZONE_LABEL_ITEM_FORMAT = "Time Zone:\tGMT"

const NETWORK_DEVICE_LABEL_ITEM_FORMAT = "Device label:\t\t"
const NETWORK_MAC_ADDRESS_ITEM_FORMAT = "MAC address:\t\t"

const MEM_SIZE_LABEL_ITEM_FORMAT = "Total size:\t\t\t"
const USED_MEM_LABEL_ITEM_FORMAT = "Used memory:\t"
const FREE_MEM_LABEL_ITEM_FORMAT = "Free memory:\t\t"
const SHARED_MEM_LABEL_ITEM_FORMAT = "Shared size:\t\t"
const BUFFER_MEM_LABEL_ITEM_FORMAT = "Buff/Chache:\t\t"
const AVAILABLE_MEM_LABEL_ITEM_FORMAT = "Available:\t\t\t"

const CPU_SPEED_DETAILS_ITEM_LABEL = "Clock speed"

const CORE_0_ITEM_LABEL = "Core 1:\t\t"
const CORE_1_ITEM_LABEL = "Core 2:\t"
const CORE_2_ITEM_LABEL = "Core 3:\t"
const CORE_3_ITEM_LABEL = "Core 4:\t"

const CORE_SPEED_ITEM_LABEL = "Speed:\t\t\t"

const CPU_VENDOR_LABEL_ITEM_FORMAT = "Vendor:\t"
const CPU_MODEL_LABEL_ITEM_FORMAT = "Model:\t\t"
const CPU_CORES_LABEL_ITEM_FORMAT = "Cores:\t\t"
const CPU_SPEED_LABEL_ITEM_FORMAT = "Average:\t"

const OS_LABEL_ITEM_FORMAT = "Operative System:\t"
const NODE_NAME_LABEL_ITEM_FORMAT = "Node Name:\t\t\t"
const ARCHITECTURE_LABEL_ITEM_FORMAT = "Architecture:\t\t\t"
const RELEASE_DATE_LABEL_ITEM_FORMAT = "Released date:\t\t"

const CPU_USAGE_FIST_LABEL = "% ("
const CPU_USAGE_SECOND_LABEL = "°C)"

const LOADING_TEXT = "Loading..."
const PANEL_BUTTON_LABEL_STARTING_TEXT = "Updating..."

const DATE_MENU_ITEM = "dateMenu"

const INFO_COMMAND = "/home/santiago/.scripts/custom-bar-script.sh -a"

const MAIN_LOOP_REFRESH_RATE = 1.0

let timeout, unaPanelMenu, cpuPanelMenu, memPanelMenu, netPanelMenu, dtePanelMenu
let infoCommand_process_source_id, infoCommand_process_stream, infoCommand_process_pid

const DtePanelMenu = new Lang.Class({
	Name: DTE_NAME,
	Extends: PanelMenu.Button,

	_updateDte: function(result) {
		var result_list = result.split(COMMA)

		this.dteButtonLabel.set_text( result_list[0] )
		this.dteWeekDayItem.label.set_text( DAY_LABEL_ITEM_FORMAT + result_list[1] + SPACE + result_list[2] )
		this.dteMonthItem.label.set_text( MONTH_LABEL_ITEM_FORMAT + result_list[3] )
		this.dteYearItem.label.set_text( YEAR_LABEL_ITEM_FORMAT + result_list[4] )
		this.dteFullTimeItem.label.set_text( FULL_TIME_LABEL_ITEM_FORMAT + result_list[5] )
		this.dteTimeZoneItem.label.set_text( TIME_ZONE_LABEL_ITEM_FORMAT + result_list[6] )
	},

	_createDte: function() {
		this.dteBoxIcon = new St.Icon({
            gicon: getCustomIcon(DTE_ICON),
            style_class: SYSTEM_ICON_STYLE
        })

		this.dteButtonLabel = new St.Label({ 
			text: PANEL_BUTTON_LABEL_STARTING_TEXT,
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER,
			style_class: DTE_STYLE
		})

		let dteBox = new St.BoxLayout({
			vertical: false,
			style_class: PANEL_MENU_BOX_STYLE
		})

		dteBox.add_child(this.dteBoxIcon)
		dteBox.add_child(this.dteButtonLabel)
		this.add_child(dteBox)

		this.dteWeekDayItem = new PopupMenu.PopupMenuItem(DAY_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.dteMonthItem = new PopupMenu.PopupMenuItem(MONTH_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.dteYearItem = new PopupMenu.PopupMenuItem(YEAR_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.dteFullTimeItem = new PopupMenu.PopupMenuItem(FULL_TIME_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.dteTimeZoneItem = new PopupMenu.PopupMenuItem(TIME_ZONE_LABEL_ITEM_FORMAT + LOADING_TEXT)

		this.dteWeekDayItem.actor.reactive = false
		this.dteMonthItem.actor.reactive = false
		this.dteYearItem.actor.reactive = false
		this.dteFullTimeItem.actor.reactive = false
		this.dteTimeZoneItem.actor.reactive = false

		this.menu.addMenuItem(this.dteWeekDayItem)
		this.menu.addMenuItem(this.dteMonthItem)
		this.menu.addMenuItem(this.dteYearItem)
		this.menu.addMenuItem(this.dteFullTimeItem)
		this.menu.addMenuItem(this.dteTimeZoneItem)
	},

	_init: function() {
		this.parent(0.0, DTE_NAME)
		this._createDte()
    }
})

const NetPanelMenu = new Lang.Class({
	Name: NET_NAME,
	Extends: PanelMenu.Button,

	_updateNet: function(result) {
		var result_list = result.split(COMMA)

		this.netButtonRxLabel.set_text( result_list[0] + SPACE +  UNIT_KILOBYTES_PER_SECOND )
		this.netButtonTxLabel.set_text( result_list[1] + SPACE +  UNIT_KILOBYTES_PER_SECOND )
		this.netDeviceLabelItem.label.set_text( NETWORK_DEVICE_LABEL_ITEM_FORMAT + result_list[2] )
		this.netMacAddressItem.label.set_text( NETWORK_MAC_ADDRESS_ITEM_FORMAT + result_list[3])
	},

	_createNetBox: function() {
		this.netBoxRxIcon = new St.Icon({
            gicon: getCustomIcon(NET_RX_ICON),
            style_class: SYSTEM_ICON_STYLE,
        })

		this.netBoxTxIcon = new St.Icon({
            gicon: getCustomIcon(NET_TX_ICON),
            style_class: SYSTEM_ICON_STYLE,
        })

		this.netButtonRxLabel = new St.Label({ 
			text: PANEL_BUTTON_LABEL_STARTING_TEXT,
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER,
			style_class: NET_STYLE
		})
		this.netButtonTxLabel = new St.Label({ 
			text: PANEL_BUTTON_LABEL_STARTING_TEXT,
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER,
			style_class: NET_STYLE
		})

		let netBox = new St.BoxLayout({
			vertical: false,
			style_class: PANEL_MENU_BOX_STYLE
		})

		netBox.add_child(this.netBoxRxIcon)
		netBox.add_child(this.netButtonRxLabel)
		netBox.add_child(this.netBoxTxIcon)
		netBox.add_child(this.netButtonTxLabel)
		this.add_child(netBox)

		this.netDeviceLabelItem = new PopupMenu.PopupMenuItem(LOADING_TEXT)
		this.netMacAddressItem = new PopupMenu.PopupMenuItem(LOADING_TEXT)

		this.netDeviceLabelItem.actor.reactive = false
		this.netMacAddressItem.actor.reactive = false

		this.menu.addMenuItem(this.netDeviceLabelItem)
		this.menu.addMenuItem(this.netMacAddressItem)
	},

	_init: function() {
		this.parent(0.0, NET_NAME)
		this._createNetBox()
    }
})

const MemPanelMenu = new Lang.Class({
	Name: MEM_NAME,
	Extends: PanelMenu.Button,

	_updateMem: function(result) {
		var result_list = result.split(COMMA)

		this.memButtonLabel.set_text( result_list[0] + PERCENTAGE )
		this.memTotalSizeItem.label.set_text( MEM_SIZE_LABEL_ITEM_FORMAT + result_list[1] + SPACE + UNIT_GIGABYTE )
		this.memUsedItem.label.set_text( USED_MEM_LABEL_ITEM_FORMAT + result_list[2] + SPACE +  UNIT_GIGABYTE )
		this.memFreeItem.label.set_text( FREE_MEM_LABEL_ITEM_FORMAT + result_list[3] + SPACE +  UNIT_GIGABYTE )
		this.memSharedItem.label.set_text( SHARED_MEM_LABEL_ITEM_FORMAT + result_list[4] + SPACE +  UNIT_MEGABYTE )
		this.memBufferItem.label.set_text( BUFFER_MEM_LABEL_ITEM_FORMAT + result_list[5] + SPACE +  UNIT_GIGABYTE )
		this.memAvailableItem.label.set_text(  AVAILABLE_MEM_LABEL_ITEM_FORMAT + result_list[6] + SPACE +  UNIT_GIGABYTE )
	},

	_createMemBox: function() {
		this.memBoxIcon = new St.Icon({
            gicon: getCustomIcon(MEM_ICON),
            style_class: SYSTEM_ICON_STYLE,
        })

		this.memButtonLabel = new St.Label({ 
			text: PANEL_BUTTON_LABEL_STARTING_TEXT,
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER,
			style_class: MEM_STYLE
		})

		let memBox = new St.BoxLayout({
			vertical: false,
			style_class: PANEL_MENU_BOX_STYLE
		})

		memBox.add_child(this.memBoxIcon)
		memBox.add_child(this.memButtonLabel)
		this.add_child(memBox)

		this.memTotalSizeItem = new PopupMenu.PopupMenuItem(MEM_SIZE_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.memUsedItem = new PopupMenu.PopupMenuItem(USED_MEM_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.memFreeItem = new PopupMenu.PopupMenuItem(FREE_MEM_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.memSharedItem = new PopupMenu.PopupMenuItem(SHARED_MEM_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.memBufferItem = new PopupMenu.PopupMenuItem(BUFFER_MEM_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.memAvailableItem = new PopupMenu.PopupMenuItem(AVAILABLE_MEM_LABEL_ITEM_FORMAT + LOADING_TEXT)

		this.memTotalSizeItem.actor.reactive = false
		this.memUsedItem.actor.reactive = false
		this.memFreeItem.actor.reactive = false
		this.memSharedItem.actor.reactive = false
		this.memBufferItem.actor.reactive = false
		this.memAvailableItem.actor.reactive = false

		this.menu.addMenuItem(this.memTotalSizeItem)
		this.menu.addMenuItem(this.memUsedItem)
		this.menu.addMenuItem(this.memFreeItem)
		this.menu.addMenuItem(this.memSharedItem)
		this.menu.addMenuItem(this.memBufferItem)
		this.menu.addMenuItem(this.memAvailableItem)
	},

	_init: function() {
		this.parent(0.0, MEM_NAME)
		this._createMemBox()
    }
})

const CpuPanelMenu = new Lang.Class({
	Name: CPU_NAME,
	Extends: PanelMenu.Button,

	_updateCpu: function(result) {
		var result_list = result.split(COMMA)

		this.cpuButtonLabel.set_text( result_list[0] + CPU_USAGE_FIST_LABEL + result_list[1] + CPU_USAGE_SECOND_LABEL )
		this.cpuModelItem.label.set_text( CPU_MODEL_LABEL_ITEM_FORMAT + result_list[2] )
		this.cpuVendorItem.label.set_text( CPU_VENDOR_LABEL_ITEM_FORMAT + result_list[3] )
		this.cpuNumberOfCoresItem.label.set_text( CPU_CORES_LABEL_ITEM_FORMAT + result_list[4] )
		this.cpuSpeedItem.label.set_text( CPU_SPEED_LABEL_ITEM_FORMAT + result_list[5] + SPACE + UNIT_MEGAHERTZ )
		this.core0Item.label.set_text( CORE_0_ITEM_LABEL + result_list[6] + SPACE + UNIT_MEGAHERTZ )
		this.core1Item.label.set_text( CORE_1_ITEM_LABEL + result_list[7] + SPACE + UNIT_MEGAHERTZ )
		this.core2Item.label.set_text( CORE_2_ITEM_LABEL + result_list[8] + SPACE + UNIT_MEGAHERTZ )
		this.core3Item.label.set_text( CORE_3_ITEM_LABEL + result_list[9] + SPACE + UNIT_MEGAHERTZ )
	},

	_createCpuBox: function() {
		this.cpuBoxIcon = new St.Icon({
            gicon: getCustomIcon(CPU_ICON),
            style_class: SYSTEM_ICON_STYLE,
        })

		this.cpuButtonLabel = new St.Label({ 
			text: PANEL_BUTTON_LABEL_STARTING_TEXT,
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER,
			style_class: CPU_STYLE
		})

		let cpuBox = new St.BoxLayout({
			vertical: false,
			style_class: PANEL_MENU_BOX_STYLE
		})

		cpuBox.add_child(this.cpuBoxIcon)
		cpuBox.add_child(this.cpuButtonLabel)
		this.add_child(cpuBox)

		this.cpuVendorItem = new PopupMenu.PopupMenuItem(CPU_VENDOR_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.cpuModelItem = new PopupMenu.PopupMenuItem(CPU_MODEL_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.cpuNumberOfCoresItem = new PopupMenu.PopupMenuItem(CPU_CORES_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.cpuDetailsItem = new PopupMenu.PopupSubMenuMenuItem(CPU_SPEED_DETAILS_ITEM_LABEL)

		this.cpuVendorItem.actor.reactive = false
		this.cpuModelItem.actor.reactive = false
		this.cpuNumberOfCoresItem.actor.reactive = false
		this.cpuDetailsItem.actor.reactive = true

		// Sub Items
		this.cpuSpeedItem = new PopupMenu.PopupMenuItem(CPU_SPEED_LABEL_ITEM_FORMAT + LOADING_TEXT)
		this.core0Item = new PopupMenu.PopupMenuItem(CORE_0_ITEM_LABEL + LOADING_TEXT)
		this.core1Item = new PopupMenu.PopupMenuItem(CORE_1_ITEM_LABEL + LOADING_TEXT)
		this.core2Item = new PopupMenu.PopupMenuItem(CORE_2_ITEM_LABEL + LOADING_TEXT)
		this.core3Item = new PopupMenu.PopupMenuItem(CORE_3_ITEM_LABEL + LOADING_TEXT)

		this.cpuSpeedItem.actor.reactive = false
		this.core0Item.actor.reactive = false
		this.core1Item.actor.reactive = false
		this.core2Item.actor.reactive = false
		this.core3Item.actor.reactive = false

		this.cpuDetailsItem.menu.addMenuItem(this.cpuSpeedItem)
		this.cpuDetailsItem.menu.addMenuItem(this.core0Item)
		this.cpuDetailsItem.menu.addMenuItem(this.core1Item)
		this.cpuDetailsItem.menu.addMenuItem(this.core2Item)
		this.cpuDetailsItem.menu.addMenuItem(this.core3Item)

		this.menu.addMenuItem(this.cpuVendorItem)
		this.menu.addMenuItem(this.cpuModelItem)
		this.menu.addMenuItem(this.cpuNumberOfCoresItem)
		this.menu.addMenuItem(this.cpuDetailsItem)
	},

	_init: function() {
		this.parent(0.0, CPU_NAME)
		this._createCpuBox()
    }
})

const UnaPanelMenu = new Lang.Class({
	Name: UNA_NAME,
	Extends: PanelMenu.Button,

	_updateUna: function(result) {
		var result_list = result.split(COMMA)

		this.unaButtonLabel.set_text( result_list[0] )
		this.unaOperativeSystemItem.label.set_text( OS_LABEL_ITEM_FORMAT + result_list[1] )
		this.unaNodeItem.label.set_text( NODE_NAME_LABEL_ITEM_FORMAT + result_list[2] )
		this.unaArchitectureItem.label.set_text( ARCHITECTURE_LABEL_ITEM_FORMAT + result_list[3] )
		this.unaVersionItem.label.set_text( RELEASE_DATE_LABEL_ITEM_FORMAT + result_list[4] )
	},

	_createUnameBox: function() {
		this.unaBoxIcon = new St.Icon({
            gicon: getCustomIcon(UNA_ICON),
            style_class: SYSTEM_ICON_STYLE
        })

		this.unaButtonLabel = new St.Label({ 
			text: PANEL_BUTTON_LABEL_STARTING_TEXT,
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER,
			style_class: UNA_STYLE
		})

		let unaBox = new St.BoxLayout({
			vertical: false,
			style_class: PANEL_MENU_BOX_STYLE
		})

		unaBox.add_child(this.unaBoxIcon)
		unaBox.add_child(this.unaButtonLabel)
		this.add_child(unaBox)

		this.unaOperativeSystemItem = new PopupMenu.PopupMenuItem(LOADING_TEXT)
		this.unaNodeItem = new PopupMenu.PopupMenuItem(LOADING_TEXT)
		this.unaArchitectureItem = new PopupMenu.PopupMenuItem(LOADING_TEXT)
		this.unaVersionItem = new PopupMenu.PopupMenuItem(LOADING_TEXT)

		this.unaOperativeSystemItem.actor.reactive = false
		this.unaNodeItem.actor.reactive = false
		this.unaArchitectureItem.actor.reactive = false
		this.unaVersionItem.actor.reactive = false

		this.menu.addMenuItem(this.unaOperativeSystemItem)
		this.menu.addMenuItem(this.unaNodeItem)
		this.menu.addMenuItem(this.unaArchitectureItem)
		this.menu.addMenuItem(this.unaVersionItem)
	},

	_init: function() {
		this.parent(0.0, UNA_NAME)
		this._createUnameBox()
    }
})

function getCustomIcon(icon_name) {
	return Gio.icon_new_for_string( Me.dir.get_path() + ICONS_DIR + icon_name + SVG_FORMAT )
}

function removeClock() {
    let centerBox = Main.panel._centerBox;
    let dateMenu = Main.panel.statusArea[DATE_MENU_ITEM];

    centerBox.remove_actor(dateMenu.container);
}

function replaceClock() {
    let centerBox = Main.panel._centerBox;
    let dateMenu = Main.panel.statusArea[DATE_MENU_ITEM];

    centerBox.add_actor(dateMenu.container);
}

function updateBarInfo(output_lines_list) {
	var information_list = output_lines_list.split(SEMICOLON)

	unaPanelMenu._updateUna(information_list[0])
	cpuPanelMenu._updateCpu(information_list[1])
	memPanelMenu._updateMem(information_list[2])
	netPanelMenu._updateNet(information_list[3])
	dtePanelMenu._updateDte(information_list[4])
}

function callback(stdout) {
    let output_lines_list = []

    if (stdout) {
        stdout.split(NEWLINE).map(line => output_lines_list.push(line));
    } else {
        outputAsOneLine = EMPTY
    }

    updateBarInfo( output_lines_list.toString() )
}

async function executeCommand(command) {
    try {
		let [parseok, argvp] = GLib.shell_parse_argv( command )
        let flags = (Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE)
        let proc = Gio.Subprocess.new(argvp, flags)

        return new Promise((resolve, reject) => {
            proc.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(res)

                    this.callback(stdout)
                    resolve(stdout)

                } catch (e) {
                    reject(e)
                }
            })
        })

    } catch (e) {
        return Promise.reject(e)
    }
}

function init() { 
	// Do nothing
}

function enable() {
	removeClock()

	unaPanelMenu = new UnaPanelMenu()
	cpuPanelMenu = new CpuPanelMenu()
	memPanelMenu = new MemPanelMenu()
	netPanelMenu = new NetPanelMenu()
	dtePanelMenu = new DtePanelMenu()
	
	Main.panel.addToStatusArea(DTE_NAME, dtePanelMenu, 0)
	Main.panel.addToStatusArea(NET_NAME, netPanelMenu, 0)
	Main.panel.addToStatusArea(MEM_NAME, memPanelMenu, 0)
	Main.panel.addToStatusArea(CPU_NAME, cpuPanelMenu, 0)
	Main.panel.addToStatusArea(UNA_NAME, unaPanelMenu, 0)

	timeout = Mainloop.timeout_add_seconds(MAIN_LOOP_REFRESH_RATE, () => {
		executeCommand( INFO_COMMAND )
		return true
	})
}

function disable() {
	replaceClock()

	Mainloop.source_remove(timeout)
	
	unaPanelMenu.destroy()
	cpuPanelMenu.destroy()
	memPanelMenu.destroy()
	netPanelMenu.destroy()
	dtePanelMenu.destroy()
}