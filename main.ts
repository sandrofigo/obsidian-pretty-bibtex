import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceItem,
	WorkspaceLeaf
} from 'obsidian';
import {StringHelper} from './StringHelper';
import {ast as bibTexParserAst, parse as bibTexParserParse} from "@retorquere/bibtex-parser";
import {Entry} from "@retorquere/bibtex-parser/grammar";

const pluginName = "Pretty BibTeX";

export default class PrettyBibTexPlugin extends Plugin {
	settings: ISettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("bibtex", (source: string, el, ctx) => {
			const codeBlock = el.createEl("div").createEl("pre").createEl("code");

			try {
				const result = bibTexParserParse(source);

				if (result.entries.length == 0)
					codeBlock.createEl("span", {text: "No valid BibTex entries found!", cls: "bibtex key"});

				const ast = bibTexParserAst(source);

				result.entries.forEach((entry, index) => {
					codeBlock.createEl("span", {text: `${entry.key}\n`, cls: "bibtex header"});

					if (this.settings.showType)
						this.addKeyValueToCodeBlock(codeBlock, "Type", entry.type);

					const desiredOrderOfFields = (ast[index] as Entry).fields.map(f => f.name);

					const sortByDesiredOrderOfFields = (a: string, b: string): number => {
						return desiredOrderOfFields.indexOf(a) - desiredOrderOfFields.indexOf(b);
					};

					Object.keys(entry.fields).sort(sortByDesiredOrderOfFields).forEach(key => {
						this.addKeyValueToCodeBlock(codeBlock, key, entry.fields[key].join(" and "));
					});

					if (result.entries.length >= 1 && index < result.entries.length - 1)
						this.addSpacerCodeBlock(codeBlock);
				});
			} catch (exception) {
				codeBlock.createEl("span", {text: "Invalid BibTeX format!", cls: "bibtex key"});
			}
		});
	}

	addKeyValueToCodeBlock(codeBlock: HTMLElement, key: string, value: string): void {
		codeBlock.createEl("span", {text: StringHelper.sanitizeKeyString(key), cls: "bibtex key"});
		codeBlock.createEl("span", {text: ":", cls: "bibtex normal"});
		codeBlock.createEl("span", {text: ` ${value}\n`, cls: "bibtex value"});
	}

	addSpacerCodeBlock(codeBlock: HTMLElement): void {
		codeBlock.createEl("span", {text: "\n", cls: "bibtex normal"});
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
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: `Settings for ${pluginName}`});

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
