# Config
 - Title: Dilemma 1: Brad

# Description
When you started, you were told that Brad was one of your top performers, but that’s not what you have experienced so far.
You have no doubt that he is talented, but you feel that he is getting sloppy (resting on the laurels?)
and often find him being arrogant, especially towards the newer team members.

It’s now time for your appraisal dialogue with Brad. What approach shall you choose?

# Choices
## You tell him exactly how you feel, and try to appeal to him to improve his behavior
 - time: -1
 - engagement: -3
 - performance: -2
 - total: round(((engagement * performance) / 100) - (100 - time))
 - next: brad_a

## You pick up 3 problematic situations from the past month where Brad’s behaviour have been a problem, and ask him to explain himself
 - time: -1
 - engagement: -4
 - performance: -3
 - total: round(((engagement * performance) / 100) - (100 - time))
 - next: brad_b

## You assume that there is an underlying problem that you should identify first. Therefore you start asking positive questions about what Brad likes/dislikes about his job – and ask into his ambitions for the future
 - time: -1
 - engagement: +2
 - performance: +2
 - total: round(((engagement * performance) / 100) - (100 - time))
 - next: brad_c

## You let him know that you are aware that there is a serious problem – but tell him that you are ready to help and coach him in weekly conversations for at least the coming 4 weeks
 - time: -5
 - engagement: +0
 - performance: +0
 - total: round(((engagement * performance) / 100) - (100 - time))
 - next: brad_d
