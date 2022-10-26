import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceItem, WorkspaceLeaf } from 'obsidian';
import { StringHelper } from './StringHelper';

const pluginName: string = "Pretty BibTeX";

export default class PrettyBibTexPlugin extends Plugin {
	settings: ISettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("bibtex", (source: string, el, ctx) => {
			let codeBlock = el.createEl("div").createEl("pre").createEl("code");

			let regExpBibTex = new RegExp("@(?<type>.*?){\\s*(?<id>.*?),(?<attributes>.*)}", "s");
			let matchBibTex = source.match(regExpBibTex);

			if (matchBibTex && matchBibTex.groups) {
				let type = matchBibTex.groups.type;
				let id = matchBibTex.groups.id;

				codeBlock.createEl("span", { text: `${id}\n`, cls: "bibtex header" });

				if (this.settings.showType)
					this.addKeyValueToCodeBlock(codeBlock, "Type", type);

				let attributes = matchBibTex.groups.attributes;

				//TODO: split at \n; check if line contains "="; when not, merge with previous line; apply regex below

				let regExpAttributes = new RegExp("(?<key>\\w+)\\s*=\\s*(?<value>.*)", "g");

				for (const match of attributes.matchAll(regExpAttributes)) {
					if (!match.groups)
						continue;

					let key = match.groups.key;
					let value = match.groups.value.trim().replace(/\{/gs, "",).replace(/\}/gs, "",);
					value = StringHelper.trim(value, ",");
					value = StringHelper.trim(value, "\"");

					this.addKeyValueToCodeBlock(codeBlock, key, value);
				}
			} else {
				codeBlock.createEl("span", { text: "Invalid BibTeX format!", cls: "bibtex key" });
			}
		});
	}

	addKeyValueToCodeBlock(codeBlock: HTMLElement, key: string, value: string): void {
		codeBlock.createEl("span", { text: StringHelper.sanitizeKeyString(key), cls: "bibtex key" });
		codeBlock.createEl("span", { text: ":", cls: "bibtex normal" });
		codeBlock.createEl("span", { text: ` ${value}\n`, cls: "bibtex value" });
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

interface ISettings {
	showType: boolean;
}

const DEFAULT_SETTINGS: ISettings = {
	showType: true
}

class SettingTab extends PluginSettingTab {
	plugin: PrettyBibTexPlugin;

	constructor(app: App, plugin: PrettyBibTexPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: `Settings for ${pluginName}` });

		new Setting(containerEl)
			.setName('Show Type')
			.setDesc('Shows the type e.g. "article"')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showType)
				.onChange(async (value) => {
					this.plugin.settings.showType = value;
					await this.plugin.saveSettings();
				}));
	}
}
