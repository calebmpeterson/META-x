import Cocoa

enum FieldKind {
    case string, text
}

struct Field {
    let kind: FieldKind
    let label: String
}

class DraggableView: NSView {
    override var mouseDownCanMoveWindow: Bool { true }
}

// Borderless windows cannot become key by default, which prevents text
// inputs from receiving focus / keystrokes.
class KeyableWindow: NSWindow {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { true }
}

// A multi-line NSTextField. Reuses the standard rounded text-field control so
// it inherits the rounded bezel, focus ring, font handling, and value access
// of the single-line variant. Plain Enter would normally commit the field;
// the delegate intercepts it so it inserts a newline, matching expectations
// for a text-area input.
class MultilineTextField: NSTextField, NSTextFieldDelegate {
    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        configure()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        configure()
    }

    private func configure() {
        delegate = self
        bezelStyle = .roundedBezel
        isEditable = true
        isSelectable = true
        usesSingleLineMode = false
        lineBreakMode = .byWordWrapping
        cell?.wraps = true
        cell?.isScrollable = false
    }

    func control(_ control: NSControl, textView: NSTextView, doCommandBy commandSelector: Selector) -> Bool {
        if commandSelector == #selector(NSResponder.insertNewline(_:)) {
            textView.insertText("\n", replacementRange: textView.selectedRange())
            return true
        }
        return false
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    var escMonitor: Any?
    var fields: [Field] = []
    var fieldEntries: [(label: String, control: NSTextField)] = []

    func applicationDidFinishLaunching(_ notification: Notification) {
        fields = parseArgs()

        let width: CGFloat = 480
        let horizontalPadding: CGFloat = 20
        let verticalPadding: CGFloat = 20
        let fieldSpacing: CGFloat = 12
        let labelHeight: CGFloat = 16
        let inputHeight: CGFloat = 24
        let textHeight: CGFloat = 80
        let buttonHeight: CGFloat = 28
        let labelToInputSpacing: CGFloat = 4

        var contentHeight: CGFloat = verticalPadding * 2 + buttonHeight + fieldSpacing
        for field in fields {
            contentHeight += labelHeight + labelToInputSpacing
            contentHeight += field.kind == .text ? textHeight : inputHeight
            contentHeight += fieldSpacing
        }
        if !fields.isEmpty {
            contentHeight -= fieldSpacing
        }

        let height = max(contentHeight, 120)

        window = KeyableWindow(
            contentRect: NSMakeRect(0, 0, width, height),
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        window.isOpaque = false
        window.backgroundColor = .clear
        window.hasShadow = true
        window.level = .floating
        window.isMovableByWindowBackground = true
        window.center()

        let container = DraggableView(frame: NSMakeRect(0, 0, width, height))
        container.wantsLayer = true
        container.layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
        container.layer?.cornerRadius = 10
        container.layer?.borderWidth = 0
        container.layer?.borderColor = NSColor.gray.cgColor
        container.translatesAutoresizingMaskIntoConstraints = false

        container.shadow = NSShadow()
        container.shadow?.shadowColor = NSColor.black.withAlphaComponent(0.3)
        container.shadow?.shadowOffset = NSMakeSize(0, -1)
        container.shadow?.shadowBlurRadius = 6
        container.layer?.masksToBounds = false

        window.contentView = container

        if #available(macOS 10.14, *) {
            let visualEffect = NSVisualEffectView(frame: container.bounds)
            visualEffect.autoresizingMask = [.width, .height]
            visualEffect.material = .windowBackground
            visualEffect.state = .active
            visualEffect.wantsLayer = true
            visualEffect.layer?.cornerRadius = 10
            visualEffect.layer?.masksToBounds = true

            container.addSubview(visualEffect, positioned: .below, relativeTo: container)
        }

        let stack = NSStackView()
        stack.orientation = .vertical
        stack.alignment = .leading
        stack.spacing = fieldSpacing
        stack.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(stack)

        for field in fields {
            let group = NSStackView()
            group.orientation = .vertical
            group.alignment = .leading
            group.spacing = labelToInputSpacing
            group.translatesAutoresizingMaskIntoConstraints = false

            let labelView = NSTextField(labelWithString: field.label)
            labelView.font = .systemFont(ofSize: 12, weight: .semibold)
            group.addArrangedSubview(labelView)

            let control = makeControl(for: field)
            control.translatesAutoresizingMaskIntoConstraints = false
            group.addArrangedSubview(control)

            NSLayoutConstraint.activate([
                control.widthAnchor.constraint(equalTo: group.widthAnchor),
            ])
            if field.kind == .text {
                control.heightAnchor.constraint(equalToConstant: textHeight).isActive = true
            }

            stack.addArrangedSubview(group)
            NSLayoutConstraint.activate([
                group.widthAnchor.constraint(equalTo: stack.widthAnchor),
            ])

            fieldEntries.append((label: field.label, control: control))
        }

        let cancelButton = NSButton(title: "Cancel", target: self, action: #selector(cancelButtonPressed))
        cancelButton.bezelStyle = .rounded
        cancelButton.keyEquivalent = "\u{1B}"
        cancelButton.translatesAutoresizingMaskIntoConstraints = false

        let submitButton = NSButton(title: "Submit", target: self, action: #selector(submit))
        submitButton.bezelStyle = .rounded
        submitButton.keyEquivalent = "\r"
        submitButton.translatesAutoresizingMaskIntoConstraints = false

        let buttonRow = NSStackView(views: [cancelButton, submitButton])
        buttonRow.orientation = .horizontal
        buttonRow.spacing = 8
        buttonRow.alignment = .centerY
        buttonRow.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(buttonRow)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: container.topAnchor, constant: verticalPadding),
            stack.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: horizontalPadding),
            stack.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -horizontalPadding),

            buttonRow.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -horizontalPadding),
            buttonRow.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: -verticalPadding),

            cancelButton.heightAnchor.constraint(equalToConstant: buttonHeight),
            submitButton.heightAnchor.constraint(equalToConstant: buttonHeight),
        ])

        // Wire up tab order: each input -> next, last -> cancel -> submit -> back to first.
        let inputs = fieldEntries.map { $0.control }
        for (index, view) in inputs.enumerated() {
            if index + 1 < inputs.count {
                view.nextKeyView = inputs[index + 1]
            }
        }
        if let lastInput = inputs.last {
            lastInput.nextKeyView = cancelButton
        }
        cancelButton.nextKeyView = submitButton
        submitButton.nextKeyView = inputs.first

        if let firstInput = inputs.first {
            window.initialFirstResponder = firstInput
        }

        if let screen = NSScreen.main {
            let screenFrame = screen.visibleFrame
            let x = screenFrame.origin.x + (screenFrame.width - width) * 0.5
            let y = screenFrame.origin.y + (screenFrame.height - height) * 0.66
            window.setFrameOrigin(NSPoint(x: x, y: y))
        }

        NSApp.activate(ignoringOtherApps: true)
        window.makeKeyAndOrderFront(nil)

        if let firstInput = inputs.first {
            window.makeFirstResponder(firstInput)
        }

        escMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            // ESC: cancel
            if event.keyCode == 53 {
                self?.cancel()
                return nil
            }
            // Shift+Enter: submit (works even in multi-line text fields where
            // plain Enter would otherwise insert a newline)
            if event.keyCode == 36 && event.modifierFlags.contains(.shift) {
                self?.submit()
                return nil
            }
            return event
        }
    }

    func parseArgs() -> [Field] {
        var result: [Field] = []
        var index = 1
        let args = CommandLine.arguments
        while index < args.count {
            let arg = args[index]
            let kind: FieldKind?
            switch arg {
            case "--string": kind = .string
            case "--text": kind = .text
            default: kind = nil
            }
            if let kind = kind, index + 1 < args.count {
                result.append(Field(kind: kind, label: args[index + 1]))
                index += 2
            } else {
                index += 1
            }
        }
        return result
    }

    func makeControl(for field: Field) -> NSTextField {
        switch field.kind {
        case .string:
            let input = NSTextField()
            input.isEditable = true
            input.isSelectable = true
            input.bezelStyle = .roundedBezel
            return input
        case .text:
            return MultilineTextField()
        }
    }

    @objc func submit() {
        var values: [String: String] = [:]
        for entry in fieldEntries {
            values[entry.label] = entry.control.stringValue
        }

        if let data = try? JSONSerialization.data(withJSONObject: values, options: []) {
            FileHandle.standardOutput.write(data)
            FileHandle.standardOutput.write("\n".data(using: .utf8) ?? Data())
        }

        NSApp.terminate(nil)
    }

    @objc func cancelButtonPressed() {
        cancel()
    }

    func cancel() {
        window.close()
        exit(1)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()
