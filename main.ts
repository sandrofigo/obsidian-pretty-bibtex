import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceItem, WorkspaceLeaf } from 'obsidian';
import { StringHelper } from './StringHelper';
import './string.extensions';

const matcherBibTex = require('@orcid/bibtex-parse-js');
const pluginName = "Pretty BibTeX";

export default class PrettyBibTexPlugin extends Plugin {
	settings: ISettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("bibtex", (source: string, el, ctx) => {
			const codeBlock = el.createEl("div").createEl("pre").createEl("code");

			try {
				const result = matcherBibTex.toJSON(source);
				result.forEach((it: { [x: string]: any; }) => {
					let id = it["citationKey"];
					let type = it["entryType"];

					codeBlock.createEl("span", { text: `${id}\n`, cls: "bibtex header" });
					if (this.settings.showType)
						this.addKeyValueToCodeBlock(codeBlock, "Type", type);

					let dict = it["entryTags"];
					let keys = Object.keys(dict);
					for (let i = 0; i < keys.length; i++) {
						this.addKeyValueToCodeBlock(codeBlock, keys[i], dict[keys[i]]);
					}

				});
			} catch (exception) {
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
