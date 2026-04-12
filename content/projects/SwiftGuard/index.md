---
title: SwiftGuard
date: 2026-04-11
summary: A useful AI reviewer agent for generating XCUItest codes to guard safety update of any SwiftUI github repo.
tags:
  - Swift
  - LLM
  - Agent
  - Github Action
draft: false
authors: []
---

This is a result from *try! Swift Tokyo 2026 Hackathon for Studetns* event.

- You can also try it [here](https://github.com/issyuNaN/SwiftGuard) if you are interested!

We picked the topic of developing an ai agent for automaticlly writing up the XCUI codes for reviewing every PR on the watched repo. Everytime you pulled a request, it will trigger the SwiftGuard to do code quality analysis with static analysis and complex analysis with LLM.

The functions are as follows:

- **Security**: hardcoded secrets, force unwraps, insecure network calls
- **Performance**: retain cycles, unnecessary re-renders, main thread blocking
- **Code quality**: naming violations, commit message format, missing docs
- **Architecture**: pattern violations, breaking changes, impact analysis
- **Visual**: layout issues, accessibility, consistency (via screenshots)
- **Team**: auto-assign reviewers, PR size labels, split suggestions
