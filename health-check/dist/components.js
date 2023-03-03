console.log("main.js");
class Logger {
  _durations = {};
  log(...t) {
    console.log(...t);
  }
  startDuration(t) {
    this._durations[t] = Date.now();
  }
  endDuration(t) {
    var e;
    return this._durations[t]
      ? ((e = Date.now() - this._durations[t]), console.log(t + " ::: " + e), e)
      : (console.warn("Logger Warn ::: call before startDuration(id)"), "");
  }
}
(window.logger = new Logger()), console.log("logger");
class UUIDGenerator {
  _uuids = [];
  get(t) {
    for (;;) {
      var e = Math.round(1e3 * Math.random()),
        e = t ? t + "__" + e : "" + e;
      if (!this._uuids.includes(e)) return this._uuids.push(e), e;
    }
  }
  del() {}
}
window.uuidGenerator = new UUIDGenerator();
class StateElement extends HTMLElement {
  constructor(t) {
    super(),
      this.attachShadow({ mode: "open" }),
      (this._state = t?.state),
      (this._styleSheet = document.createElement("style")),
      (this._styleSheet.textContent = t?.styleSheet ?? "");
  }
  get state() {
    return this._state;
  }
  setState(t) {
    (this._state =
      "function" == typeof t ? t(this._state) : { ...this._state, ...t }),
      this._render();
  }
  connectedCallback() {
    this.childrenHTML = this.innerHTML;
    var t = this.getAttributeNames();
    this.props = {};
    for (const e of t) this.props[e] = this.getAttribute(e);
    this._render();
  }
  _render() {
    if (this.render) {
      var { html: t, handlers: e } = this.render();
      this.shadowRoot.innerHTML = "" + t + this._styleSheet.outerHTML;
      for (const r in e) {
        var s = this.shadowRoot.querySelector(`[${r}]`);
        if (s) {
          var n = e[r];
          if (n) for (const o in n) s.addEventListener("" + o, n[o].bind(this));
        }
      }
    }
  }
  redner() {
    return {};
  }
}
class StatelessElement extends HTMLElement {
  constructor(t) {
    super(),
      this.attachShadow({ mode: "open" }),
      (this._styleSheet = document.createElement("style")),
      (this._styleSheet.textContent = t?.styleSheet ?? "");
  }
  connectedCallback() {
    this.childrenHTML = this.innerHTML;
    var t = this.getAttributeNames();
    this.props = {};
    for (const e of t) this.props[e] = this.getAttribute(e);
    this._render();
  }
  _render() {
    var t = this.render();
    this.shadowRoot.innerHTML = "" + t + this._styleSheet.outerHTML;
  }
  get rootAttrs() {
    var t = [],
      e = this.props;
    for (const s in e) t.push(`${s}="${e[s]}"`);
    return t.join(" ");
  }
}
class AllCheckButton extends StateElement {
  constructor() {
    super({
      state: {},
      styleSheet: `
        
      `
    });
  }
  _handleClick() {
    document.querySelectorAll("health-check-item").forEach((t) => t.click());
  }
  render() {
    var t = window.uuidGenerator.get("allCheckBtn");
    return {
      html: `<custom-button ${t}> All Site Check </custom-button>`,
      handlers: { [t]: { click: this._handleClick } }
    };
  }
}
customElements.define("all-check-button", AllCheckButton);
class HealthCheckItem extends StateElement {
  constructor() {
    super({
      state: { loading: !1, result: null, returnTime: 0, toggleFlag: !1 },
      styleSheet: `
        .container {
          border-top: 1px solid #aaaaaa;
          border-bottom: 1px solid #aaaaaa;
          margin-bottom: 10px;
        }

        .flex {
          display: flex;
          # justify-content: center;
          align-items: center;
          height: 50px;
        }

        label {
          display: block;
          width: 200px;
          line-height: 10px;
        }

        .result-box {
          text-align: center;
          flex: 1;
        }

        .sites-container {
          margin-top: 5px;
          margin-bottom: 5px;
        }
      `
    });
  }
  async _checkUrl() {
    if (this.props.url) {
      this.setState({ loading: !0 }), window.logger.startDuration("fetch url");
      let e = !0;
      try {
        await fetch(this.props.url, {
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" }
        });
      } catch (t) {
        e = !1;
      } finally {
        this.setState({
          loading: !1,
          returnTime: window.logger.endDuration("fetch url"),
          result: e
        });
      }
    }
  }
  render() {
    var t = uuidGenerator.get("check-button"),
      e = uuidGenerator.get("toggle-button"),
      s = this.props.url
        ? this.state.loading
          ? "<custom-button disabled>loading...</custom-button>"
          : `<custom-button ${t}>Check</custom-button>`
        : "",
      n = this.props.sites
        ? `<text-button ${e}>${
            this.state.toggleFlag ? "Close" : "Detail"
          }</text-button>`
        : "",
      r =
        null !== this.state.result
          ? `<span>${this.state.result ? "정상" : "비정상"}(${
              this.state.returnTime
            }ms)</span>`
          : "",
      o = this.props.url
        ? `<a href="${this.props.url}" target="_blank">Site</a>`
        : "",
      i =
        this.state.toggleFlag && this.props.sites
          ? `
      <div class="sites-container">
        ${this.props.sites
          .split(",")
          .map(
            (t) => `
          <div>
            &nbsp;&nbsp;&nbsp;<a href="${t}" target="_blank">${t}</a>
          </div>
        `
          )
          .join("")}
      </div>
    `
          : "";
    return {
      html: `
        <div class="container">
          <div class="flex">
            <label>
              ${o}&nbsp;&nbsp;&nbsp;
              ${this.props.label ?? ""}
              ${n}
            </label>

            <div class="result-box">
              ${r}
            </div>

            ${s}
          </div>
          ${i}
          ${this.childrenHTML}
        </div>
      `,
      handlers: {
        [t]: { click: this._checkUrl },
        [e]: {
          click: () => {
            this.setState({ toggleFlag: !this.state.toggleFlag });
          }
        }
      }
    };
  }
  click() {
    this._checkUrl();
  }
}
customElements.define("health-check-item", HealthCheckItem);
class CustomButton extends StatelessElement {
  constructor() {
    super({
      styleSheet: `
        .btn {
          min-width: 100px;
          text-align: center;

          background-color:#0a0a23;
          color: #fff;
          border:none; 

          border-radius:10px; 
          padding:15px;
        }

        .btn[disabled] {
          background-color: #aaaaaa;
        }
      `
    });
  }
  render() {
    return `<button ${this.rootAttrs} class="btn">${this.childrenHTML}</button>`;
  }
}
customElements.define("custom-button", CustomButton);
class TextButton extends StatelessElement {
  constructor() {
    super({
      styleSheet: `
        .btn {
          border: none;
          background-color: none;
          outline: none;
        }

        .btn[disabled] {
          
        }
      `
    });
  }
  render() {
    return `<button ${this.rootAttrs} class="btn">${this.childrenHTML}</button>`;
  }
}
customElements.define("text-button", TextButton);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJMb2dnZXIuanMiLCJVVUlER2VuZXJhdG9yLmpzIiwiU3RhdGVFbGVtZW50LmpzIiwiU3RhdGVsZXNzRWxlbWVudC5qcyIsIkFsbENoZWNrQnV0dG9uLmpzIiwiSGVhbHRoQ2hlY2tJdGVtLmpzIiwiQ3VzdG9tQnV0dG9uLmpzIiwiVGV4dEJ1dHRvbi5qcyJdLCJuYW1lcyI6WyJjb25zb2xlIiwibG9nIiwiTG9nZ2VyIiwiX2R1cmF0aW9ucyIsInN0cnMiLCJzdGFydER1cmF0aW9uIiwiaWQiLCJ0aGlzIiwiRGF0ZSIsIm5vdyIsImVuZER1cmF0aW9uIiwiZHVyYXRpb24iLCJ3YXJuIiwid2luZG93IiwibG9nZ2VyIiwiVVVJREdlbmVyYXRvciIsIl91dWlkcyIsImdldCIsInByZWZpeCIsIk1hdGgiLCJyb3VuZCIsInJhbmRvbSIsInV1aWQiLCJpbmNsdWRlcyIsInB1c2giLCJkZWwiLCJ1dWlkR2VuZXJhdG9yIiwiU3RhdGVFbGVtZW50IiwiSFRNTEVsZW1lbnQiLCJjb25zdHJ1Y3RvciIsImNvbmZpZyIsInN1cGVyIiwiYXR0YWNoU2hhZG93IiwibW9kZSIsIl9zdGF0ZSIsInN0YXRlIiwiX3N0eWxlU2hlZXQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0ZXh0Q29udGVudCIsInN0eWxlU2hlZXQiLCJzZXRTdGF0ZSIsIl9yZW5kZXIiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNoaWxkcmVuSFRNTCIsImlubmVySFRNTCIsImF0dHJOYW1lcyIsImdldEF0dHJpYnV0ZU5hbWVzIiwicHJvcHMiLCJuYW1lIiwiZ2V0QXR0cmlidXRlIiwicmVuZGVyIiwiaHRtbCIsImhhbmRsZXJzIiwic2hhZG93Um9vdCIsIm91dGVySFRNTCIsImVsIiwicXVlcnlTZWxlY3RvciIsImhhbmRsZXIiLCJldmVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJiaW5kIiwicmVkbmVyIiwiU3RhdGVsZXNzRWxlbWVudCIsInJvb3RBdHRycyIsImxldCIsImF0dHJzIiwiam9pbiIsIkFsbENoZWNrQnV0dG9uIiwiX2hhbmRsZUNsaWNrIiwicXVlcnlTZWxlY3RvckFsbCIsImZvckVhY2giLCIkaXRlbSIsImNsaWNrIiwiY3VzdG9tRWxlbWVudHMiLCJkZWZpbmUiLCJIZWFsdGhDaGVja0l0ZW0iLCJsb2FkaW5nIiwicmVzdWx0IiwicmV0dXJuVGltZSIsInRvZ2dsZUZsYWciLCJfY2hlY2tVcmwiLCJ1cmwiLCJhd2FpdCIsImZldGNoIiwiaGVhZGVycyIsIkNvbnRlbnQtVHlwZSIsImUiLCJjaGVja0J1dHRvbklkIiwidG9nZ2xlQnV0dG9uSWQiLCJDaGVja0J1dHRvbiIsIlRvZ2dsZUJ1dHRvbiIsInNpdGVzIiwiUmVzdWx0U3BhbiIsIlNpdGVBbmNob3IiLCJMaXN0Iiwic3BsaXQiLCJtYXAiLCJsYWJlbCIsIkN1c3RvbUJ1dHRvbiIsIlRleHRCdXR0b24iXSwibWFwcGluZ3MiOiJBQUFBQSxRQUFBQyxJQUFBLFNBQUEsUUNBQUMsT0FFQUMsV0FBQSxHQUVBRixPQUFBRyxHQUNBSixRQUFBQyxJQUFBLEdBQUFHLENBQUEsQ0FDQSxDQUVBQyxjQUFBQyxHQUNBQyxLQUFBSixXQUFBRyxHQUFBRSxLQUFBQyxJQUFBLENBQ0EsQ0FPQUMsWUFBQUosR0FDQSxJQU1BSyxFQU5BLE9BQUFKLEtBQUFKLFdBQUFHLElBTUFLLEVBREFILEtBQUFDLElBQUEsRUFDQUYsS0FBQUosV0FBQUcsR0FDQU4sUUFBQUMsSUFBQUssRUFBQSxRQUFBSyxDQUFBLEVBQ0FBLElBUEFYLFFBQUFZLEtBQUEsK0NBQUEsRUFDQSxHQU9BLENBQ0EsQ0FFQUMsT0FBQUMsT0FBQSxJQUFBWixPQUVBRixRQUFBQyxJQUFBLFFBQUEsUUNoQ0FjLGNBQ0FDLE9BQUEsR0FFQUMsSUFBQUMsR0FDQSxPQUFBLENBQ0EsSUFBQVosRUFBQWEsS0FBQUMsTUFBQSxJQUFBRCxLQUFBRSxPQUFBLENBQUEsRUFDQUMsRUFBQUosRUFBQUEsRUFBQSxLQUFBWixFQUFBLEdBQUFBLEVBRUEsR0FBQUMsQ0FBQUEs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ImNvbnNvbGUubG9nKCdtYWluLmpzJyk7IiwiY2xhc3MgTG9nZ2VyIHtcbiAgLyoqIEB0eXBlcyAqL1xuICBfZHVyYXRpb25zID0ge307XG5cbiAgbG9nKC4uLnN0cnMpIHtcbiAgICBjb25zb2xlLmxvZyguLi5zdHJzKTtcbiAgfVxuXG4gIHN0YXJ0RHVyYXRpb24oaWQpIHtcbiAgICB0aGlzLl9kdXJhdGlvbnNbaWRdID0gRGF0ZS5ub3coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDroZzqt7gg7Lac66ClIOuwjyDqsrDqs7wg6rCSIOuwmO2ZmFxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gZHVyYXRpb25cbiAgICovXG4gIGVuZER1cmF0aW9uKGlkKSB7XG4gICAgaWYoIXRoaXMuX2R1cmF0aW9uc1tpZF0pIHtcbiAgICAgIGNvbnNvbGUud2FybignTG9nZ2VyIFdhcm4gOjo6IGNhbGwgYmVmb3JlIHN0YXJ0RHVyYXRpb24oaWQpJylcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBkdXJhdGlvbiA9IGUgLSB0aGlzLl9kdXJhdGlvbnNbaWRdXG4gICAgY29uc29sZS5sb2coYCR7aWR9IDo6OiAke2R1cmF0aW9ufWApO1xuICAgIHJldHVybiBkdXJhdGlvbjtcbiAgfVxufVxuXG53aW5kb3cubG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXG5jb25zb2xlLmxvZygnbG9nZ2VyJyk7IiwiY2xhc3MgVVVJREdlbmVyYXRvciB7XG4gIF91dWlkcyA9IFtdO1xuXG4gIGdldChwcmVmaXgpIHtcbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICBjb25zdCBpZCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDApO1xuICAgICAgY29uc3QgdXVpZCA9IHByZWZpeCA/IGAke3ByZWZpeH1fXyR7aWR9YCA6IGAke2lkfWA7XG5cbiAgICAgIGlmKHRoaXMuX3V1aWRzLmluY2x1ZGVzKHV1aWQpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl91dWlkcy5wdXNoKHV1aWQpO1xuICAgICAgcmV0dXJuIHV1aWQ7XG4gICAgfVxuICB9XG5cbiAgZGVsKCkge31cbn1cblxud2luZG93LnV1aWRHZW5lcmF0b3IgPSBuZXcgVVVJREdlbmVyYXRvcigpOyIsImNsYXNzIFN0YXRlRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgLyoqXG4gICAqIO2VoOydvFxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBDb25maWdcbiAgICogQHByb3BlcnR5IHthbnl9IHN0YXRlIC0g7ZWg7J28IGlkXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdHlsZVNoZWV0IC0g7ZWg7J28IOuCtOyaqVxuICAgKi9cblxuICAvKipcbiAgICogXG4gICAqIEBwYXJhbSB7Q29uZmlnfSBjb25maWdcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hdHRhY2hTaGFkb3coe1xuICAgICAgbW9kZTogJ29wZW4nLFxuICAgIH0pO1xuICAgIHRoaXMuX3N0YXRlID0gY29uZmlnPy5zdGF0ZTtcblxuICAgIHRoaXMuX3N0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHRoaXMuX3N0eWxlU2hlZXQudGV4dENvbnRlbnQgPSBjb25maWc/LnN0eWxlU2hlZXQgPz8gJyc7XG4gIH07XG5cbiAgZ2V0IHN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgfVxuXG4gIHNldFN0YXRlKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZSh0aGlzLl9zdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N0YXRlID0ge1xuICAgICAgICAuLi50aGlzLl9zdGF0ZSxcbiAgICAgICAgLi4uc3RhdGVcbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5jaGlsZHJlbkhUTUwgPSAgdGhpcy5pbm5lckhUTUw7XG4gICAgY29uc3QgYXR0ck5hbWVzID0gdGhpcy5nZXRBdHRyaWJ1dGVOYW1lcygpO1xuICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgICBmb3IoY29uc3QgbmFtZSBvZiBhdHRyTmFtZXMpIHtcbiAgICAgIHRoaXMucHJvcHNbbmFtZV0gPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIC8vIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgLy8gICBjb25zb2xlLmxvZyhcImF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFja1wiLCBuYW1lLCBvbGRWYWx1ZSB8fCBcIm51bGxcIiwgbmV3VmFsdWUpO1xuICAvLyB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICBpZiAoIXRoaXMucmVuZGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgaHRtbCwgaGFuZGxlcnNcbiAgICB9ID0gdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLnNoYWRvd1Jvb3QuaW5uZXJIVE1MID0gYCR7aHRtbH0ke3RoaXMuX3N0eWxlU2hlZXQub3V0ZXJIVE1MfWA7XG5cbiAgICBmb3IoY29uc3QgaWQgaW4gaGFuZGxlcnMpIHtcbiAgICAgIGNvbnN0IGVsID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoYFske2lkfV1gKTtcblxuICAgICAgaWYoIWVsKSBjb250aW51ZTtcblxuICAgICAgY29uc3QgaGFuZGxlciA9IGhhbmRsZXJzW2lkXTtcbiAgICAgIGlmKGhhbmRsZXIpIHtcbiAgICAgICAgZm9yKGNvbnN0IGV2ZW50IGluIGhhbmRsZXIpIHtcbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGAke2V2ZW50fWAsIGhhbmRsZXJbZXZlbnRdLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IEhhbmRsZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBSZW5kZXJJdGVtXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBodG1sXG4gICAqIEBwcm9wZXJ0eSB7SGFuZGxlcnN9IGhhbmRsZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAYWJzdHJhY3RcbiAgICogQHJldHVybiB7UmVuZGVySXRlbX1cbiAgICovXG4gIHJlZG5lcigpIHtcbiAgICByZXR1cm4ge1xuXG4gICAgfVxuICB9XG59IiwiXG5jbGFzcyBTdGF0ZWxlc3NFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYXR0YWNoU2hhZG93KHtcbiAgICAgIG1vZGU6ICdvcGVuJyxcbiAgICB9KTtcblxuICAgIHRoaXMuX3N0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHRoaXMuX3N0eWxlU2hlZXQudGV4dENvbnRlbnQgPSBjb25maWc/LnN0eWxlU2hlZXQgPz8gJyc7XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICB0aGlzLmNoaWxkcmVuSFRNTCA9ICB0aGlzLmlubmVySFRNTDtcbiAgICBjb25zdCBhdHRyTmFtZXMgPSB0aGlzLmdldEF0dHJpYnV0ZU5hbWVzKCk7XG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICAgIGZvcihjb25zdCBuYW1lIG9mIGF0dHJOYW1lcykge1xuICAgICAgdGhpcy5wcm9wc1tuYW1lXSA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIH1cblxuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICBjb25zdCBodG1sID0gdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLnNoYWRvd1Jvb3QuaW5uZXJIVE1MID0gYCR7aHRtbH0ke3RoaXMuX3N0eWxlU2hlZXQub3V0ZXJIVE1MfWA7XG4gIH1cblxuICBnZXQgcm9vdEF0dHJzKCkge1xuICAgIGxldCBhdHRycyA9IFtdO1xuICAgIGNvbnN0IHByb3BzID0gdGhpcy5wcm9wcztcbiAgICBmb3IoY29uc3QgbmFtZSBpbiBwcm9wcykge1xuICAgICAgYXR0cnMucHVzaChgJHtuYW1lfT1cIiR7cHJvcHNbbmFtZV19XCJgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0cnMuam9pbignICcpO1xuICB9XG59IiwiY2xhc3MgQWxsQ2hlY2tCdXR0b24gZXh0ZW5kcyBTdGF0ZUVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7XG4gICAgICBzdGF0ZToge1xuXG4gICAgICB9LFxuICAgICAgc3R5bGVTaGVldDogYFxuICAgICAgICBcbiAgICAgIGBcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVDbGljaygpIHtcbiAgICBjb25zdCAkaXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdoZWFsdGgtY2hlY2staXRlbScpO1xuICAgICRpdGVtcy5mb3JFYWNoKCRpdGVtID0+ICRpdGVtLmNsaWNrKCkpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGlkID0gd2luZG93LnV1aWRHZW5lcmF0b3IuZ2V0KCdhbGxDaGVja0J0bicpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGh0bWw6IGA8Y3VzdG9tLWJ1dHRvbiAke2lkfT4gQWxsIFNpdGUgQ2hlY2sgPC9jdXN0b20tYnV0dG9uPmAsXG4gICAgICBoYW5kbGVyczoge1xuICAgICAgICBbaWRdOiB7XG4gICAgICAgICAgY2xpY2s6IHRoaXMuX2hhbmRsZUNsaWNrLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdhbGwtY2hlY2stYnV0dG9uJywgQWxsQ2hlY2tCdXR0b24pOyIsImNsYXNzIEhlYWx0aENoZWNrSXRlbSBleHRlbmRzIFN0YXRlRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHtcbiAgICAgIHN0YXRlOiB7XG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICByZXN1bHQ6IG51bGwsXG4gICAgICAgIHJldHVyblRpbWU6IDAsXG4gICAgICAgIHRvZ2dsZUZsYWc6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIHN0eWxlU2hlZXQ6IGBcbiAgICAgICAgLmNvbnRhaW5lciB7XG4gICAgICAgICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkICNhYWFhYWE7XG4gICAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNhYWFhYWE7XG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5mbGV4IHtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgICMganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICBoZWlnaHQ6IDUwcHg7XG4gICAgICAgIH1cblxuICAgICAgICBsYWJlbCB7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgd2lkdGg6IDIwMHB4O1xuICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxMHB4O1xuICAgICAgICB9XG5cbiAgICAgICAgLnJlc3VsdC1ib3gge1xuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICBmbGV4OiAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNpdGVzLWNvbnRhaW5lciB7XG4gICAgICAgICAgbWFyZ2luLXRvcDogNXB4O1xuICAgICAgICAgIG1hcmdpbi1ib3R0b206IDVweDtcbiAgICAgICAgfVxuICAgICAgYFxuICAgIH0pO1xuICB9O1xuXG4gIGFzeW5jIF9jaGVja1VybCgpIHtcbiAgICBpZighdGhpcy5wcm9wcy51cmwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgfSk7XG5cbiAgICB3aW5kb3cubG9nZ2VyLnN0YXJ0RHVyYXRpb24oJ2ZldGNoIHVybCcpO1xuICAgIGxldCByZXN1bHQgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBmZXRjaCh0aGlzLnByb3BzLnVybCwge1xuICAgICAgICBtb2RlOiAnbm8tY29ycycsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgcmV0dXJuVGltZTogd2luZG93LmxvZ2dlci5lbmREdXJhdGlvbignZmV0Y2ggdXJsJyksXG4gICAgICAgIHJlc3VsdCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvLyAoe1xuICAgIC8vICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgLy8gICBwcm9wczogdGhpcy5wcm9wcyxcbiAgICAvLyAgIGNoaWxkcmVuOiB0aGlzLmNoaWxkcmVuSFRNTCxcbiAgICAvLyB9KTtcblxuICAgIGNvbnN0IGNoZWNrQnV0dG9uSWQgPSB1dWlkR2VuZXJhdG9yLmdldCgnY2hlY2stYnV0dG9uJyk7XG4gICAgY29uc3QgdG9nZ2xlQnV0dG9uSWQgPSB1dWlkR2VuZXJhdG9yLmdldCgndG9nZ2xlLWJ1dHRvbicpO1xuXG4gICAgY29uc3QgQ2hlY2tCdXR0b24gPSB0aGlzLnByb3BzLnVybCA/IFxuICAgICAgIXRoaXMuc3RhdGUubG9hZGluZyBcbiAgICAgICAgPyBgPGN1c3RvbS1idXR0b24gJHtjaGVja0J1dHRvbklkfT5DaGVjazwvY3VzdG9tLWJ1dHRvbj5gXG4gICAgICAgIDogJzxjdXN0b20tYnV0dG9uIGRpc2FibGVkPmxvYWRpbmcuLi48L2N1c3RvbS1idXR0b24+J1xuICAgICAgOiAnJztcblxuXG4gICAgY29uc3QgVG9nZ2xlQnV0dG9uID0gdGhpcy5wcm9wcy5zaXRlc1xuICAgICAgLy8gP2A8dGV4dC1idXR0b24gJHt0b2dnbGVCdXR0b25JZH0+JHt0aGlzLnN0YXRlLnRvZ2dsZUZsYWcgPyAn4pa8JzogJ+KWuid9PC90ZXh0LWJ1dHRvbj5gXG4gICAgICA/YDx0ZXh0LWJ1dHRvbiAke3RvZ2dsZUJ1dHRvbklkfT4ke3RoaXMuc3RhdGUudG9nZ2xlRmxhZyA/ICdDbG9zZSc6ICdEZXRhaWwnfTwvdGV4dC1idXR0b24+YFxuICAgICAgOiAnJztcbiAgICBcbiAgICBjb25zdCBSZXN1bHRTcGFuID0gdGhpcy5zdGF0ZS5yZXN1bHQgIT09IG51bGwgXG4gICAgICA/IGA8c3Bhbj4ke3RoaXMuc3RhdGUucmVzdWx0ID8gJ+ygleyDgScgOiAn67mE7KCV7IOBJ30oJHt0aGlzLnN0YXRlLnJldHVyblRpbWV9bXMpPC9zcGFuPmBcbiAgICAgIDogJyc7XG5cbiAgICBjb25zdCBTaXRlQW5jaG9yID0gdGhpcy5wcm9wcy51cmwgPyBgPGEgaHJlZj1cIiR7dGhpcy5wcm9wcy51cmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+U2l0ZTwvYT5gIDogJyc7XG5cbiAgICBjb25zdCBMaXN0ID0gdGhpcy5zdGF0ZS50b2dnbGVGbGFnICYmIHRoaXMucHJvcHMuc2l0ZXMgPyBgXG4gICAgICA8ZGl2IGNsYXNzPVwic2l0ZXMtY29udGFpbmVyXCI+XG4gICAgICAgICR7dGhpcy5wcm9wcy5zaXRlcy5zcGxpdCgnLCcpLm1hcCh1cmwgPT4gYFxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAmbmJzcDsmbmJzcDsmbmJzcDs8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHt1cmx9PC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgKS5qb2luKCcnKX1cbiAgICAgIDwvZGl2PlxuICAgIGAgOiAnJztcblxuICAgIHJldHVybiB7XG4gICAgICBodG1sOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleFwiPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICAke1NpdGVBbmNob3J9Jm5ic3A7Jm5ic3A7Jm5ic3A7XG4gICAgICAgICAgICAgICR7dGhpcy5wcm9wcy5sYWJlbCA/PyAnJ31cbiAgICAgICAgICAgICAgJHtUb2dnbGVCdXR0b259XG4gICAgICAgICAgICA8L2xhYmVsPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdWx0LWJveFwiPlxuICAgICAgICAgICAgICAke1Jlc3VsdFNwYW59XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgJHtDaGVja0J1dHRvbn1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAke0xpc3R9XG4gICAgICAgICAgJHt0aGlzLmNoaWxkcmVuSFRNTH1cbiAgICAgICAgPC9kaXY+XG4gICAgICBgLFxuICAgICAgaGFuZGxlcnM6IHtcbiAgICAgICAgW2NoZWNrQnV0dG9uSWRdOiB7XG4gICAgICAgICAgY2xpY2s6IHRoaXMuX2NoZWNrVXJsXG4gICAgICAgIH0sXG4gICAgICAgIFt0b2dnbGVCdXR0b25JZF06IHtcbiAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgIHRvZ2dsZUZsYWc6ICF0aGlzLnN0YXRlLnRvZ2dsZUZsYWcsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBwdWJsaWMgbWV0aG9kXG4gIGNsaWNrKCkge1xuICAgIHRoaXMuX2NoZWNrVXJsKCk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdoZWFsdGgtY2hlY2staXRlbScsIEhlYWx0aENoZWNrSXRlbSk7IiwiY2xhc3MgQ3VzdG9tQnV0dG9uIGV4dGVuZHMgU3RhdGVsZXNzRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHtcbiAgICAgIHN0eWxlU2hlZXQ6IGBcbiAgICAgICAgLmJ0biB7XG4gICAgICAgICAgbWluLXdpZHRoOiAxMDBweDtcbiAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG5cbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiMwYTBhMjM7XG4gICAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgICAgYm9yZGVyOm5vbmU7IFxuXG4gICAgICAgICAgYm9yZGVyLXJhZGl1czoxMHB4OyBcbiAgICAgICAgICBwYWRkaW5nOjE1cHg7XG4gICAgICAgIH1cblxuICAgICAgICAuYnRuW2Rpc2FibGVkXSB7XG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2FhYWFhYTtcbiAgICAgICAgfVxuICAgICAgYFxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiBgPGJ1dHRvbiAke3RoaXMucm9vdEF0dHJzfSBjbGFzcz1cImJ0blwiPiR7dGhpcy5jaGlsZHJlbkhUTUx9PC9idXR0b24+YFxuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnY3VzdG9tLWJ1dHRvbicsIEN1c3RvbUJ1dHRvbik7IiwiY2xhc3MgVGV4dEJ1dHRvbiBleHRlbmRzIFN0YXRlbGVzc0VsZW1lbnQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7XG4gICAgICBzdHlsZVNoZWV0OiBgXG4gICAgICAgIC5idG4ge1xuICAgICAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiBub25lO1xuICAgICAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgICAgIH1cblxuICAgICAgICAuYnRuW2Rpc2FibGVkXSB7XG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgIGBcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gYDxidXR0b24gJHt0aGlzLnJvb3RBdHRyc30gY2xhc3M9XCJidG5cIj4ke3RoaXMuY2hpbGRyZW5IVE1MfTwvYnV0dG9uPmBcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3RleHQtYnV0dG9uJywgVGV4dEJ1dHRvbik7Il19
