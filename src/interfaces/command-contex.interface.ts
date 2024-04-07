import { MessageCommandContext, SlashCommandContext, UserCommandContext } from 'necord';

export type CommandContext = MessageCommandContext | SlashCommandContext | UserCommandContext;
