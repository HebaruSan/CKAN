using System;
using System.Collections.Generic;

namespace CKAN.ConsoleUI.Toolkit {

    /// <summary>
    /// Base class for UI elements like labels, fields, frames, list boxes, etc.
    /// </summary>
    public abstract class ScreenObject {

        /// <summary>
        /// Initialize the object
        /// </summary>
        /// <param name="l">X coordinate of left edge</param>
        /// <param name="t">Y coordinate of top edge</param>
        /// <param name="r">X coordinate of right edge</param>
        /// <param name="b">Y coordinate of bottom edge</param>
        protected ScreenObject(int l, int t, int r, int b)
        {
            left   = l;
            top    = t;
            right  = r;
            bottom = b;
        }

        /// <summary>
        /// Add padding to the left and right edges of a string to center it in a given WindowWidth
        /// </summary>
        /// <param name="s">String to center</param>
        /// <param name="w">Width of space to center in</param>
        /// <returns>
        /// {padding}s{padding}
        /// </returns>
        public static string PadCenter(string s, int w)
        {
            if (s.Length > w) {
                return s.Substring(0, w);
            } else {
                int lp = (w - s.Length) / 2;
                return FormatExactWidth(s, w - lp).PadLeft(w);
            }
        }

        /// <summary>
        /// Truncate or pad a string to fit a given width exactly
        /// </summary>
        /// <param name="val">String to process</param>
        /// <param name="w">Width to fit</param>
        /// <returns>
        /// val{padding} or substring of val
        /// </returns>
        public static string FormatExactWidth(string val, int w)
        {
            return val.Trim().PadRight(w).Substring(0, w);
        }

        /// <summary>
        /// Custom key bindings for this UI element
        /// </summary>
        public Dictionary<ConsoleKeyInfo, ConsoleScreen.KeyAction> Bindings =
            new Dictionary<ConsoleKeyInfo, ConsoleScreen.KeyAction>();

        /// <summary>
        /// Add a custom key bindings
        /// </summary>
        /// <param name="k">Key to bind</param>
        /// <param name="a">Action to bind to key</param>
        public void AddBinding(ConsoleKeyInfo k, ConsoleScreen.KeyAction a)
        {
            Bindings.Add(k, a);
        }

        /// <summary>
        /// Tips to show in the footer when this UI element is focused
        /// </summary>
        public List<ScreenTip> Tips = new List<ScreenTip>();

        /// <summary>
        /// Add tip to show in footer
        /// </summary>
        /// <param name="key">Description of the key</param>
        /// <param name="descrip">Description of the action bound to the key</param>
        /// <param name="displayIf">Function returning true to show the tip, false to hide it</param>
        public void AddTip(string key, string descrip, Func<bool> displayIf = null)
        {
            if (displayIf == null) {
                displayIf = () => true;
            }
            Tips.Add(new ScreenTip(key, descrip, displayIf));
        }


        /// <returns>
        /// X coordinate of left edge of dialog
        /// </returns>
        protected int GetLeft()   { return FmtUtils.ConvertCoord(left,   Console.WindowWidth);  }
        /// <returns>
        /// Y coordinate of top edge of dialog
        /// </returns>
        protected int GetTop()    { return FmtUtils.ConvertCoord(top,    Console.WindowHeight); }
        /// <returns>
        /// X coordinate of right edge of dialog
        /// </returns>
        protected int GetRight()  { return FmtUtils.ConvertCoord(right,  Console.WindowWidth);  }
        /// <returns>
        /// Y coordinate of bottom edge of dialog
        /// </returns>
        protected int GetBottom() { return FmtUtils.ConvertCoord(bottom, Console.WindowHeight); }

        /// <summary>
        /// Draw the UI element
        /// </summary>
        /// <param name="focused">If true, draw with focus, else draw without focused</param>
        public abstract void Draw(bool focused);

        /// <summary>
        /// Return whether the UI element can accept focus
        /// </summary>
        public virtual bool Focusable() { return true; }
        /// <summary>
        /// Place focus based on the UI element's positioning
        /// </summary>
        public virtual void PlaceCursor() { }
        /// <summary>
        /// Handle default key bindings for the UI element
        /// </summary>
        public virtual void OnKeyPress(ConsoleKeyInfo k) { }

        /// <summary>
        /// Type for event to notify container that we'd like to lose focus
        /// </summary>
        public delegate void BlurListener(ScreenObject sender, bool forward);
        /// <summary>
        /// Event to notify container that we'd like to lose focus
        /// </summary>
        public event BlurListener OnBlur;
        /// <summary>
        /// Function to fire event to notify container that we'd like to lose focus
        /// </summary>
        protected void Blur(bool forward)
        {
            if (OnBlur != null) {
                OnBlur(this, forward);
            }
        }

        private int left, top, right, bottom;
    }

}
