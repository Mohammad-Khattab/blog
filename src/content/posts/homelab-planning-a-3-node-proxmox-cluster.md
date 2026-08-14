---
title: "Planning a 3-Node Proxmox Cluster"
date: 2026-08-01
tags: ["homelab"]
summary: "Laying out the goals and hardware plan for a 3-node Proxmox homelab before buying anything."
---

I'm starting my homelab before I own most of the hardware for it, on purpose —
writing the plan down first forces me to actually decide what I want instead of
buying gear and figuring it out later.

## The plan

Three nodes running Proxmox VE, split across a mix of services:

- DNS-level ad-blocking (Pi-hole or AdGuard Home)
- A WireGuard VPN for remote access
- File and photo storage
- Jellyfin for media
- A small Minecraft server
- General app hosting (containers for whatever I'm tinkering with)
- Home Assistant, once I have smart-home gear and a 3D printer to integrate
- A local LLM, once I have the hardware to run one reasonably

## Why document this now

Future posts in this series will cover node selection, networking (VLANs, DNS,
VPN setup), and the actual service rollout — each as its own post, tagged
`homelab`, so this page can act as an index once there's more than one.
