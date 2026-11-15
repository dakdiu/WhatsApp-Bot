
import { buildMenu } from "../lib/menu.js";

function formatDuration(seconds) {
  let remaining = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const parts = [];

  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");
  if (secs || !parts.length) parts.push(secs + "s");

  return parts.join(" ");
}

function messageTimestampMs(message) {
  const raw = message && message.messageTimestamp;
  const value = raw && typeof raw.toNumber === "function"
    ? raw.toNumber()
    : Number(raw);

  if (!Number.isFinite(value) || value <= 0) return null;
  return value > 1000000000000 ? value : value * 1000;
}

function ownerNumber(config) {
  const owners = Array.isArray(config.ownerNumbers)
    ? config.ownerNumbers
    : [];

  return String(owners[0] || "").replace(/\D/g, "");
}

const commands = [
  {
    name: "menu",
    aliases: ["helpme"],
    category: "General",
    description: "Show the branded DKD-Bot menu and available command sections.",
    run: async ctx => {
      const menu = buildMenu({
        commands: ctx.commands,
        config: ctx.config,
        theme: ctx.theme
      });

      if (ctx.config.imageUrl) {
        try {
          await ctx.send({
            image: { url: ctx.config.imageUrl },
            caption:
              "🤖 *𝗗𝗞𝗗-𝗕𝗢𝗧 — 𝗦𝗠𝗔𝗥𝗧 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗔𝗦𝗦𝗜𝗦𝗧𝗔𝗡𝗧*\n\n" +
              "✧ Official pairing portal: " + ctx.config.botUrl + "\n" +
              "⚡ Powered by DKD Global Technologies"
          });
        } catch (error) {
          console.warn(
            "DKD-Bot menu artwork could not be sent; using the text menu:",
            error?.message || error
          );
        }
      }

      await ctx.reply(menu);
    }
  },

  {
    name: "help",
    category: "General",
    description: "List registered commands and their descriptions.",
    run: async ctx => {
      const rows = (ctx.commands || [])
        .filter(command => !command.hidden)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(command =>
          ctx.config.prefix + command.name +
          (command.description ? " — " + command.description : "")
        );

      const header =
        "╭━━━〔 📚 𝗗𝗞𝗗-𝗕𝗢𝗧 𝗛𝗘𝗟𝗣 〕━━━✦\n" +
        "┃ ✧ " + rows.length + " Registered Commands\n" +
        "╰━━━━━━━━━━━━━━✦\n\n";

      const chunks = [];
      let current = header;

      for (const row of rows) {
        if (current.length + row.length + 1 > 3300) {
          chunks.push(current.trimEnd());

          current =
            "╭━━━〔 📚 𝗗𝗞𝗗-𝗕𝗢𝗧 𝗛𝗘𝗟𝗣 〕━━━✦\n\n";
        }

        current += "┃ ▸ " + row + "\n";
      }

      if (current.trim()) chunks.push(current.trimEnd());

      for (const chunk of chunks) {
        await ctx.reply(chunk);
      }
    }
  },

  {
    name: "ping",
    category: "General",
    description: "Check bot responsiveness and estimated message response time.",
    run: async ctx => {
      const timestamp = messageTimestampMs(ctx.msg);
      const responseMs = timestamp === null
        ? null
        : Math.max(0, Date.now() - timestamp);

      await ctx.reply([
        "╭━━━〔 🏓 𝗗𝗞𝗗-𝗕𝗢𝗧 · 𝗣𝗢𝗡𝗚 〕━━━✦",
        "┃ ✧ Status: " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),
        "┃ ✧ Response: " + (responseMs === null ? "Unavailable" : responseMs + " ms"),
        "┃ ✧ Uptime: " + formatDuration(process.uptime()),
        "┃ ✧ Version: " + ctx.config.version,
        "╰━━━━━━━━━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },

  {
    name: "alive",
    aliases: ["uptime"],
    category: "General",
    description: "Show bot status, mode and uptime.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 🤖 𝗗𝗞𝗗-𝗕𝗢𝗧 〕━━━✦\n" +
        "┃ ✧ Status: " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡") +
        "\n┃ ✧ Mode: " + String(ctx.mode || "public").toUpperCase() +
        "\n┃ ✧ Uptime: " + formatDuration(process.uptime()) +
        "\n┃ ✧ Powered by DKD Global Technologies\n" +
        "╰━━━━━━━━━━━━━━✦"
      );
    }
  },

  {
    name: "owner",
    category: "General",
    description: "Show DKD-Bot owner details.",
    run: async ctx => {
      const number = ownerNumber(ctx.config);

      await ctx.reply(
        "╭━━━〔 👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 〕━━━✦\n" +
        "┃ ✧ Owner: " + ctx.config.ownerName +
        (number ? "\n┃ ✧ Owner number: +" + number : "") +
        "\n╰━━━━━━━━━━━━━━✦"
      );
    }
  },

  {
    name: "support",
    category: "General",
    description: "Show support guidance for DKD-Bot.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 🛟 𝗗𝗞𝗗-𝗕𝗢𝗧 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 〕━━━✦\n" +
        "┃ ✧ For setup help or bug reports,\n" +
        "┃ ✧ Contact: " + ctx.config.ownerName +
        "\n┃ ✧ GitHub: https://github.com/Benfeitech/FEI-XMD\n" +
        "╰━━━━━━━━━━━━━━✦"
      );
    }
  },

  {
    name: "time",
    category: "General",
    description: "Show the current server time in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());

      await ctx.reply(
        "🕒 𝗡𝗜𝗚𝗘𝗥𝗜𝗔 𝗧𝗜𝗠𝗘\n" +
        "┃ ✧ " + value
      );
    }
  },

  {
    name: "date",
    category: "General",
    description: "Show the current date in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(new Date());

      await ctx.reply(
        "📅 𝗡𝗜𝗚𝗘𝗥𝗜𝗔 𝗗𝗔𝗧𝗘\n" +
        "┃ ✧ " + value
      );
    }
  },

  {
    name: "version",
    category: "General",
    description: "Show DKD-Bot version and connection status.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 🤖 𝗗𝗞𝗗-𝗕𝗢𝗧 𝗩𝗘𝗥𝗦𝗜𝗢𝗡 〕━━━✦\n" +
        "┃ ✧ Name: " + ctx.config.name +
        "\n┃ ✧ Version: " + ctx.config.version +
        "\n┃ ✧ Status: " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡") +
        "\n┃ ✧ Mode: " + String(ctx.mode || "public").toUpperCase() +
        "\n┃ ✧ Baileys: Official WhiskeySockets package\n" +
        "╰━━━━━━━━━━━━━━✦"
      );
    }
  },

  {
    name: "jid",
    aliases: ["id"],
    category: "General",
    description: "Show the current chat and message sender IDs.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 🆔 𝗖𝗛𝗔𝗧 𝗜𝗡𝗙𝗢 〕━━━✦\n" +
        "┃ ✧ Chat ID: " + ctx.jid +
        "\n┃ ✧ Sender ID: " + (ctx.senderJid || "Unavailable") +
        "\n╰━━━━━━━━━━━━━━✦"
      );
    }
  },

  {
    name: "whoami",
    category: "General",
    description: "Show your WhatsApp sender information.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 👤 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 〕━━━✦\n" +
        "┃ ✧ Name: " + (ctx.msg?.pushName || "Unknown") +
        "\n┃ ✧ Your ID: " + (ctx.senderJid || "Unavailable") +
        "\n┃ ✧ Owner: " + (ctx.owner ? "Yes 👑" : "No") +
        "\n╰━━━━━━━━━━━━━━✦"
      );
    }
  }
];

export default commands;
