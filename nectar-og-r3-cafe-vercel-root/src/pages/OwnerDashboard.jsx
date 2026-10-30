            type="url"
            value={form.instagramUrl}
            onChange={(event) =>
              setForm({
                ...form,
                instagramUrl: event.target.value,
              })
            }
          />
        </label>

        <label className="wide">
          Customer order note

          <textarea
            rows="3"
            value={form.orderNote}
            onChange={(event) =>
              setForm({
                ...form,
                orderNote: event.target.value,
              })
            }
          />
        </label>

        <div className="wide">
          <button
            className="primary-btn"
            disabled={saving}
          >
            <Save size={16} />

            {saving
              ? "Saving..."
              : "Save cafe settings"}
          </button>
        </div>
      </form>
    </section>
  );
}

function QrPanel() {
  const menuUrl = `${window.location.origin}/menu`;

  return (
    <section className="admin-panel qr-panel">
      <div>
        <p className="eyebrow">
          PRINT ON TABLES & COUNTERS
        </p>

        <h2>Permanent Customer Menu QR</h2>

        <p>
          This QR opens the fixed <strong>/menu</strong> page.
          You can change prices and menu items later without
          reprinting it.
        </p>

        <div className="qr-instructions">
          <h3>For table-by-table ordering</h3>

          <ol>
            <li>
              Print a QR for your main menu.
            </li>

            <li>
              For a table-specific QR, add{" "}
              <code>?table=1</code>,{" "}
              <code>?table=2</code>, etc. to the menu URL.
            </li>

            <li>
              The customer checkout will automatically show
              their table number.
            </li>

            <li>
              Keep the same domain after printing.
            </li>
          </ol>
        </div>
      </div>

      <div className="qr-card">
        <QRCodeSVG
          value={menuUrl}
          size={260}
          includeMargin
        />

        <strong>{menuUrl}</strong>

        <button
          className="secondary-btn"
          onClick={() =>
            navigator.clipboard?.writeText(menuUrl)
          }
        >
          Copy menu link
        </button>
      </div>
    </section>
  );
}
