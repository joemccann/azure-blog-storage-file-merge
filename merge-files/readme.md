# Azure Function TimerTrigger

⏲ The `TimerTrigger` fires every 10 minutes for the `merge-files` function.

## How It Works

For a `TimerTrigger` to work, you provide a schedule in the form of a
[cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression).

A cron expression is a string with 6 separate expressions which represent
a given schedule via patterns. The pattern we use to represent every 5
minutes is `0 */10 * * * *`.

This, in plain text, means:

> When seconds is equal to 0, minutes is divisible
by 10, for any hour, day of the month, month, day of the week, or year.