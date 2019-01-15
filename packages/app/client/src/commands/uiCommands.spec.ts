jest.mock("../ui/dialogs", () => ({
  AzureLoginPromptDialogContainer: class {},
  AzureLoginSuccessDialogContainer: class {},
  BotCreationDialog: class {},
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: class {}
}));
import { EditorActions, OpenEditorAction } from "../data/action/editorActions";
import * as Constants from "../constants";
import {
  CONTENT_TYPE_APP_SETTINGS,
  DOCUMENT_ID_APP_SETTINGS
} from "../constants";
import {
  NavBarActions,
  SelectNavBarAction
} from "../data/action/navBarActions";
import {
  AzureLoginPromptDialogContainer,
  AzureLoginSuccessDialogContainer,
  BotCreationDialog,
  DialogService,
  SecretPromptDialogContainer
} from "../ui/dialogs";
import { CommandRegistryImpl } from "@bfemulator/sdk-shared";
import { SharedConstants } from "@bfemulator/app-shared";
import { registerCommands } from "./uiCommands";
import * as editorHelpers from "../data/editorHelpers";
import { store } from "../data/store";
import {
  AzureAuthAction,
  AzureAuthWorkflow,
  invalidateArmToken
} from "../data/action/azureAuthActions";

const Commands = SharedConstants.Commands.UI;

describe("the uiCommands", () => {
  let registry: CommandRegistryImpl;
  beforeAll(() => {
    registry = new CommandRegistryImpl();
    registerCommands(registry);
  });

  it("should showExplorer the welcome page when the ShowWelcomePage command is dispatched", async () => {
    const spy = jest.spyOn(editorHelpers, "showWelcomePage");
    await registry.getCommand(Commands.ShowWelcomePage).handler();
    expect(spy).toHaveBeenCalled();
  });

  it("should call DialogService.showDialog when the ShowBotCreationDialog command is dispatched", async () => {
    const spy = jest.spyOn(DialogService, "showDialog");
    const result = await registry
      .getCommand(Commands.ShowBotCreationDialog)
      .handler();
    expect(spy).toHaveBeenCalledWith(BotCreationDialog);
    expect(result).toBe(true);
  });

  it("should call DialogService.showDialog when the ShowSecretPromptDialog command is dispatched", async () => {
    const spy = jest.spyOn(DialogService, "showDialog");
    const result = await registry
      .getCommand(Commands.ShowSecretPromptDialog)
      .handler();
    expect(spy).toHaveBeenCalledWith(SecretPromptDialogContainer);
    expect(result).toBe(true);
  });

  describe("should dispatch the appropriate action to the store", () => {
    it("when the SwitchNavBarTab command is dispatched", () => {
      let arg: SelectNavBarAction = {} as SelectNavBarAction;
      store.dispatch = action => ((arg as any) = action);
      registry.getCommand(Commands.SwitchNavBarTab).handler("Do it Nauuuw!");
      expect(arg.type).toBe(NavBarActions.select);
      expect(arg.payload.selection).toBe("Do it Nauuuw!");
    });

    it("when the ShowAppSettings command is dispatched", () => {
      let arg: OpenEditorAction = {} as OpenEditorAction;
      store.dispatch = action => ((arg as any) = action);
      registry.getCommand(Commands.ShowAppSettings).handler();
      expect(arg.type).toBe(EditorActions.open);
      expect(arg.payload.contentType).toBe(CONTENT_TYPE_APP_SETTINGS);
      expect(arg.payload.documentId).toBe(DOCUMENT_ID_APP_SETTINGS);
      expect(arg.payload.isGlobal).toBe(true);
    });

    it("when the SignInToAzure command is dispatched", async () => {
      let arg: AzureAuthAction<AzureAuthWorkflow> = {} as AzureAuthAction<
        AzureAuthWorkflow
      >;
      store.dispatch = action => ((arg as any) = action);
      registry.getCommand(Commands.SignInToAzure).handler();
      expect(arg.payload.loginSuccessDialog).toBe(
        AzureLoginSuccessDialogContainer
      );
      expect(arg.payload.promptDialog).toBe(AzureLoginPromptDialogContainer);
    });

    it("when the InvalidateArmToken command is dispatched", async () => {
      let arg: AzureAuthAction<void> = {} as AzureAuthAction<void>;
      store.dispatch = action => ((arg as any) = action);
      registry.getCommand(Commands.InvalidateAzureArmToken).handler();
      expect(arg).toEqual(invalidateArmToken());
    });
  });

  it("should set the proper href on the theme tag when the SwitchTheme command is dispatched", () => {
    let link = document.createElement("link");
    link.id = "themeVars";
    document.querySelector("head").appendChild(link);
    registry.getCommand(Commands.SwitchTheme).handler("light", "./light.css");
    expect(link.href).toBe("http://localhost/light.css");
  });
});
