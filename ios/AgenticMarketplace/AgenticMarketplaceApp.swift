import SwiftUI

@main
struct AgenticMarketplaceApp: App {
    var body: some Scene {
        WindowGroup {
            MarketplaceHomeView()
                .preferredColorScheme(.dark)
        }
    }
}

struct MarketplaceHomeView: View {
    private let featuredAgents = Agent.sampleFeatured
    private let skillPacks = SkillPack.sample
    private let quickActions = QuickAction.sample

    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [Color(hex: "080B12"), Color(hex: "121826"), Color(hex: "1B1240")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        header
                        searchBar
                        statsStrip

                        SectionTitleView(title: "Featured Agent Teams", subtitle: "Conductor-like command center")
                        ForEach(featuredAgents) { agent in
                            AgentCardView(agent: agent)
                        }

                        SectionTitleView(title: "Skills Marketplace", subtitle: "Composable skill packs")
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                            ForEach(skillPacks) { pack in
                                SkillCardView(skillPack: pack)
                            }
                        }

                        SectionTitleView(title: "Launchpad", subtitle: "Start an orchestration in one tap")
                        ForEach(quickActions) { action in
                            QuickActionRow(action: action)
                        }
                    }
                    .padding(20)
                }
            }
            .navigationBarHidden(true)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Conductor Market")
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            Text("Build, buy, and orchestrate multi-agent workflows with reusable skills.")
                .font(.system(size: 15, weight: .regular, design: .rounded))
                .foregroundStyle(.white.opacity(0.72))
        }
    }

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "sparkle.magnifyingglass")
                .foregroundStyle(.white.opacity(0.7))
            Text("Search agents, skills, templates")
                .foregroundStyle(.white.opacity(0.45))
                .font(.system(size: 14, weight: .medium, design: .rounded))
            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Color.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var statsStrip: some View {
        HStack(spacing: 12) {
            StatPill(title: "Live Agents", value: "72")
            StatPill(title: "Skills", value: "185")
            StatPill(title: "Avg ROI", value: "+28%")
        }
    }
}

struct SectionTitleView: View {
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            Text(subtitle)
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.65))
        }
    }
}

struct AgentCardView: View {
    let agent: Agent

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Label(agent.category, systemImage: agent.icon)
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(agent.tint.opacity(0.25), in: Capsule())
                    .foregroundStyle(agent.tint)
                Spacer()
                Text(agent.price)
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }

            Text(agent.name)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            Text(agent.summary)
                .font(.system(size: 14, weight: .regular, design: .rounded))
                .foregroundStyle(.white.opacity(0.72))

            HStack {
                Label("\(agent.activeRuns) active runs", systemImage: "bolt.horizontal.fill")
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.75))
                Spacer()
                Button("Launch") {}
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundStyle(.black)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(.white, in: Capsule())
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.white.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
        )
    }
}

struct SkillCardView: View {
    let skillPack: SkillPack

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: skillPack.icon)
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(skillPack.tint)

            Text(skillPack.name)
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            Text(skillPack.description)
                .font(.system(size: 12, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.65))
                .lineLimit(3)

            Spacer(minLength: 8)

            Text(skillPack.price)
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundStyle(.white.opacity(0.86))
        }
        .padding(14)
        .frame(maxWidth: .infinity, minHeight: 156, alignment: .topLeading)
        .background(Color.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Color.white.opacity(0.12), lineWidth: 1)
        )
    }
}

struct QuickActionRow: View {
    let action: QuickAction

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: action.icon)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(action.tint)
                .frame(width: 34, height: 34)
                .background(action.tint.opacity(0.2), in: RoundedRectangle(cornerRadius: 10, style: .continuous))

            VStack(alignment: .leading, spacing: 3) {
                Text(action.title)
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white)
                Text(action.subtitle)
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.65))
            }

            Spacer()
            Image(systemName: "chevron.right")
                .foregroundStyle(.white.opacity(0.45))
                .font(.system(size: 12, weight: .bold))
        }
        .padding(14)
        .background(Color.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct StatPill: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            Text(title)
                .font(.system(size: 11, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.62))
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

struct Agent: Identifiable {
    let id = UUID()
    let name: String
    let summary: String
    let category: String
    let icon: String
    let price: String
    let activeRuns: Int
    let tint: Color

    static let sampleFeatured: [Agent] = [
        Agent(
            name: "GrowthOps Conductor",
            summary: "Plans campaigns, launches outbound tests, and optimizes conversion loops.",
            category: "Revenue Team",
            icon: "chart.line.uptrend.xyaxis",
            price: "$49 / month",
            activeRuns: 142,
            tint: .mint
        ),
        Agent(
            name: "Talent Scout Mesh",
            summary: "Discovers candidates, scores fit, and schedules interviews across channels.",
            category: "Hiring Team",
            icon: "person.3.sequence.fill",
            price: "$59 / month",
            activeRuns: 88,
            tint: .cyan
        )
    ]
}

struct SkillPack: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let icon: String
    let price: String
    let tint: Color

    static let sample: [SkillPack] = [
        SkillPack(name: "Lead Enrichment", description: "Enriches raw prospects with role, intent, and company fit signals.", icon: "person.crop.circle.badge.checkmark", price: "$8", tint: .green),
        SkillPack(name: "Prompt Guardrails", description: "Applies policy-safe prompt templates and response filters.", icon: "lock.shield", price: "$6", tint: .orange),
        SkillPack(name: "Multi-step Memory", description: "Adds retrieval + context window compression for long workflows.", icon: "brain.head.profile", price: "$10", tint: .purple),
        SkillPack(name: "QA Automator", description: "Runs synthetic user tests and regression checks before deployments.", icon: "checkmark.seal", price: "$12", tint: .pink)
    ]
}

struct QuickAction: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let icon: String
    let tint: Color

    static let sample: [QuickAction] = [
        QuickAction(title: "Create New Agent", subtitle: "Start from skill templates", icon: "plus.rectangle.on.rectangle", tint: .blue),
        QuickAction(title: "Import Skill Pack", subtitle: "Use markdown manifest", icon: "arrow.down.doc", tint: .indigo),
        QuickAction(title: "Run Conductor Flow", subtitle: "Orchestrate your existing teams", icon: "wave.3.right", tint: .teal)
    ]
}

extension Color {
    init(hex: String) {
        let sanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&int)

        let r, g, b: UInt64
        switch sanitized.count {
        case 6:
            (r, g, b) = (int >> 16, int >> 8 & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (255, 255, 255)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: 1
        )
    }
}

#Preview {
    MarketplaceHomeView()
        .preferredColorScheme(.dark)
}
