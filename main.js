const fs = require("fs")
const ui = require("blessed")
const chalk = require("chalk")
const { exec } = require("child_process")

const config = require("/data/data/com.termux/files/home/.config/vmux/init.json")
const symbols = require("/data/data/com.termux/files/home/.config/vmux/icons.json")

let current = ""

let win = ui.screen({ smartCSR: true })

let frame = ui.box({
    parent: win,
    top: "center",
    left: "center",
    width: "50%",
    height: "60%"
})

let header = ui.box({
    parent: frame,
    width: "100%",
    height: 1,
    style: { bg: "#363636" }
})

ui.text({
    parent: header,
    content: " ⭘ ",
    style: {
        bg: "#363636"
    }
})

ui.text({
    parent: header,
    left: "center",
    content: "VMUX",
    style: {
        bg: "#363636"
    }
})

let container = ui.box({
    parent: frame,
    top: 1,
    width: "100%",
    height: "100%-1",
    style: { bg: "#252525" }
})

let tree = ui.list({
    parent: container,
    focused: true,
    keys: true,
    width: "50%",
    height: "100%",
    style: {
        bg: "#252525",
        selected: { bg: "#414141" }
    }
})

let handler = ui.list({
    parent: container,
    keys: true,
    left: "50%",
    width: "50%",
    height: "100%",
    style: {
        bg: "#252525",
        selected: { bg: "#414141" }
    }
})

handler.setItems(Object.keys(config.actions))

tree.key("right", () => { handler.focus() })

function Load(dir) {
    let files = []

    files.push(` ${chalk.hex(symbols.open_folder.color)(symbols.open_folder.icon)} ${dir.split("/").slice(-1)}`)
    fs.readdirSync(dir).forEach(item => {
        let file = fs.lstatSync(dir + "/" + item)
        if (file.isDirectory()) {
            files.push(`   ${chalk.hex(symbols.closed_folder.color)(symbols.closed_folder.icon)} ${item}`)
        }

        if (file.isFile()) {
            let sufix = item.split(".")[1]
            symbols[sufix] != undefined ? files.push(`   ${chalk.hex(symbols[sufix].color)(symbols[sufix].icon)} ${item}`) : files.push(`   ${chalk.hex(symbols.file.color)(symbols.file.icon)} ${item}`)
        }
    })

    tree.setItems(files)

    tree.on("select", item => {
        let chunks = item.content.split(" ").filter(i => { return i !== "" }).slice(1)
        let value = ""
        chunks.forEach(i => { value == "" ? value = i : value = `${value} ${i}` })
        current = `${dir}/${value}`
        handler.focus()
    })
}

Load(process.cwd())

handler.on("select", cmd => {
    exec(config.actions[cmd.content].replace("#", current))
    tree.focus()
})

win.key(["C-c"], () => { process.exit() })

win.render()
