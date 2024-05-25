import type { Client, Interaction } from "discord.js";
import CommandRegistry from "../registry/CommandRegistry";
import ButtonRegistry from "../registry/ButtonRegistry";
import ModalRegistry from "../registry/ModalRegistry";

export function run(_: Client, interaction: Interaction) {
    if (interaction.isCommand()) runCommand(_, interaction);
    else if (interaction.isModalSubmit()) runModal(_, interaction);
    else if (interaction.isButton()) runButton(_, interaction);
}

function runCommand(_: Client, interaction: Interaction) {
    // If the interaction is not a command, return
    if (!interaction.isCommand()) return;

    // Get the command from the collection
    const command = CommandRegistry.getCommand(interaction.commandName);

    // If the command does not exist, return
    if (!command) {
        interaction.reply({ content: "Command not found.", ephemeral: true });
        return;
    }

    // Try to run the command
    try {
        command.execute(interaction);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
}

function runModal(_: Client, interaction: Interaction) {
    // If the interaction is not a modal, return
    if (!interaction.isModalSubmit()) return;

    // Get the modal from the collection
    const modal = ModalRegistry.getModal(interaction.customId);

    // If the modal does not exist, return
    if (!modal) {
        interaction.reply({ content: "Modal not found.", ephemeral: true });
        return;
    }

    // Try to run the modal
    try {
        modal.execute(interaction);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: "There was an error while executing this modal!", ephemeral: true });
    }
}

function runButton(_: Client, interaction: Interaction) {
    // If the interaction is not a button, return
    if (!interaction.isButton()) return;

    // Get the button from the collection
    const button = ButtonRegistry.getButton(interaction.customId);

    // If the button does not exist, return
    if (!button) {
        interaction.reply({ content: "Modal not found.", ephemeral: true });
        return;
    }

    // Try to run the button
    try {
        button.execute(interaction);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: "There was an error while executing this button!", ephemeral: true });
    }
}
