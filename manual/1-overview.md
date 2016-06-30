# PROTONIC

_It's like other things, only different._

## Overview

Protonic is a (very) simple (framework agnostic) library for managing state through streams. It's inspired by other popular state-management patterns and libraries (notably Redux, Flux, and RxJS), but makes certain assumptions and trade-offs in support of reducing complexity and developing applications following a specific pattern. By itself, Protonic isn't much of a framework, but _is_ designed to work with a simple one-way data flow pattern that we'll describe here. (This pattern isn't anything new, but for the sake of this document and this particular flavor of the pattern we'll call it the Protonic Pattern.)
